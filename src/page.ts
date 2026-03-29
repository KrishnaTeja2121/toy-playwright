import { Connection } from './connection';
export class Page {
    constructor(
        private connection: Connection,
        private sessionId: string
    ) { }

    private send(method: string, params: object = {}) {
        return this.connection.send(method, params, this.sessionId);
    }

    public async goto(url: string) {
        console.log(`Navigating to ${url}....`);
        await this.send('Page.navigate', { url });
    }
}