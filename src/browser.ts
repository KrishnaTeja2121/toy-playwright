import { url } from 'node:inspector';
import { Connection } from './connection';
import { Page } from './page';

export class Browser {
    constructor(private connection: Connection) { }

    public async newPage(): Promise<Page> {
        console.log('Creating new target (tab)...');

        // Ask the browser to create a new Target (a new tab)
        const { targetId } = await this.connection.send('Target.createTarget', {
            url:
                'about:blank'
        });

        // Attach to this new Target to get our sessionID
        const { sessionId } = await this.connection.send('Target.attachToTarget', { targetId, flatten: true });

        console.log(`Attached successfully! TargetID: ${targetId}, SessionID: ${sessionId}`);

        const page = new Page(this.connection, sessionId);

        // We must explicitly enable the Page domain for this session to use commands like Page.navigate

        await this.connection.send('Page.enable', {}, sessionId);

        return page;
    }
    public close() {
        this.connection.close();
    }
}