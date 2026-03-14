import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

// we are using Edge as its built-in on Windows.

const BROWSER_EXECUTABLE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

export class BrowserLauncher {
    private process: ChildProcess | null = null;
    private profileDir: string | null = null;

    public async launch(): Promise<string> {
        console.log('Launching browser.......');

        // Generate a unique temporary profile directory
        this.profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'toy-playwright-profile-'));

        //Flags to control Chrome/Edge via CDP

        const browserArgs = ['--remote-debugging-port=0',//request a random open port for the debugger
            '--no-first-run', // skip the first run setup dialog
            '--no-default-browser-check', //skip the default browser prompt
            `--user-data-dir=${this.profileDir}` // Create a fresh profile
        ];

        this.process = spawn(BROWSER_EXECUTABLE_PATH, browserArgs);

        if (!this.process || !this.process.stderr) {
            throw new Error('Failed to launch browser');
        }

        // The browser prints the WebSocket URL to stderr when it starts 
        // Example: "DevTools Listening on ws://127.0.0.1:53421/devtools/browser/abc"
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({ input: this.process!.stderr! });
            rl.on('line', (line: any) => {
                console.log(`[Browser Stderr]: ${line}`);
                const match = line.match(/DevTools listening on (ws:\/\/.*)/);
                if (match) {
                    const wsEndpoint = match[1].trim();
                    console.log(`Extracted WebSocket Endpoint: ${wsEndpoint}`);
                    resolve(wsEndpoint);
                    // we dont close the readline interface here because the browser process might write more things

                }
            });

            // Handle premature exit
            this.process!.on('exit', (code, signal) => {
                console.error(`[Browser] Process exited with code ${code} and signal ${signal}`);
                reject(new Error('Browser process exited before the WebScoket URL was found'));
            });
        });
    }

    public close() {
        if (this.process) {
            console.log('Closing browser process.......');
            this.process.kill();
            this.process = null;
        }
        if (this.profileDir) {
            try {
                fs.rmSync(this.profileDir, { recursive: true, force: true });
            } catch (e) {
                console.error(`Failed to delete profile dir: ${e}`);
            }
            this.profileDir = null;
        }
    }
}