import { resolve } from 'dns';
import { Connection } from './connection';
import * as fs from 'fs';
import { format } from 'path';
import { Mouse } from './mouse';

export class Page {
    public mouse: Mouse;
    constructor(
        private connection: Connection,
        private sessionId: string
    ) {
        this.mouse = new Mouse(connection, sessionId);
    }

    private send(method: string, params: object = {}) {
        return this.connection.send(method, params, this.sessionId);
    }

    public async goto(url: string) {
        console.log(`Navigating to ${url}....`);

        // We create a promise that only resolves when the browser emits 'Page.loadEvenFired'
        const loadPromise = new Promise<void>((resolve) => {
            this.connection.once(`session-${this.sessionId}-Page.loadEventFired`, () => {
                console.log(`Page finished loading!`);
                resolve();
            });
        });

        // Tell the browser to navigate
        await this.send('Page.navigate', { url });

        // wait for our loadEventFired promise to trigger
        await loadPromise;
        console.log(`Page finished loading!`);
    }

    // 2. RUN JAVASCRIPT IN THE BROWSER
    // We pass a function, convert it to a string and send it to the browser's JS Engine(Runtime)
    public async evaluate<R>(pageFunction: () => R): Promise<R> {
        const expression = `(${pageFunction.toString()})()`;

        // Runtime.evaluate asks the browser to execute our stringified JS
        // returnByValue is CRUCILA: it tells the browser to return actual JSON result,
        // rather than a pointer to an object floating in the browser's memory

        const response = await this.send('Runtime.evaluate', {
            expression, returnByValue: true
        });
        if (response.exceptionDetails) {
            throw new Error(`Evaluation failed: ${response.exceptionDetails.exception.description}`);
        }
        return response.result.value;
    }

    // Capture A Screenshot
    public async screenshot(filePath: string) {
        console.log(`Capturing screenshot....`);
        // Page.captureScreenshot returns the image data as a Base64 encoded string
        const { data } = await this.send('Page.captureScreenshot', {
            format: 'png'
        });

        // convert the Base64 string back into binary data and wriyte it to our filesystem
        const imageBuffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, imageBuffer);
        console.log(`Screenshot saved to ${filePath}`);
    }



}