import { Connection } from "./connection";

export class Mouse {
    constructor(
        private connection: Connection,
        private sessionId: string
    ) { }

    private send(method: string, params: object = {}) {
        return this.connection.send(method, params, this.sessionId);
    }

    // A real "click" is pressing down, then releasing.
    public async click(x: number, y: number) {
        // 1. Press the left mouse button down
        await this.send('Input.dispatchMouseEvent', {
            type: 'mousePressed',
            x,
            y,
            button: 'left',
            clickCount: 1
        });

        // Optional: add a tiny delay here if you want to test how sites react to "slow" clickers
        // await new Promise(r=>setTimeout(r, 50));

        // 2. Release the left mouse button
        await this.send('Input.dispatchMouseEvent', {
            type: 'mouseReleased',
            x,
            y,
            button: 'left',
            clickCount: 1
        });

        console.log(`Mouse genuinely physically clicked at [${x}, ${y}]`);
    }
}
