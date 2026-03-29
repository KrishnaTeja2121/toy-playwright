import { BrowserLauncher } from "./src/launcher";
import { Connection } from './src/connection';
import { Browser } from "./src/browser";

async function main() {
    const launcher = new BrowserLauncher();


    try {
        const wsEndpoint = await launcher.launch();

        console.log(`Success ! Connected to browser at ${wsEndpoint}`);

        // 1. Establish JSON-RPC Connection
        const connection = new Connection(wsEndpoint);
        await connection.connect();
        console.log('Websocket Connected!');

        // 2. Send our verify first CDP command
        console.log('Requesting Browser Version...');
        const versionInfo = await connection.send('Browser.getVersion');
        console.log('Browser Version: ', versionInfo);

        //3. Browser coonection test
        const browser = new Browser(connection);

        //The magic happens here!
        const page = await browser.newPage();
        await page.goto('https://google.com');
        console.log('Wait 5 seconds to looks at the page....');

        await new Promise(r => setTimeout(r, 3000));
        browser.close();
    } catch (e) {
        console.error('Error during test:', e);
    }
    finally {

        launcher.close();
    }
}
main().catch(console.error);