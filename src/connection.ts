import { EventEmitter } from "events";
import { WebSocket } from "ws";

export class Connection extends EventEmitter {
    private ws: WebSocket;
    private lastId = 0;

    // We store pending promises here so we can resolve them when the browser replies
    private callbacks = new Map<number, { resolve: Function, reject: Function }>();

    constructor(url: string) {
        super();
        this.ws = new WebSocket(url);

        // Listen for messages from the browser
        this.ws.on('message', (data: string) => {
            this.onMessage(JSON.parse(data));
        });

        this.ws.on('close', () => {
            console.log('WebSocket Connection Closed');
        });
    }

    // Wait for the WebSocket to actually open before we send commands
    public connect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.ws.readyState === WebSocket.OPEN) {
                resolve();
            } else {
                this.ws.once('open', resolve);
            }
        });
    }
    private onMessage(message: any) {
        if (message.id) {
            //This is a response to a command we sent
            const callback = this.callbacks.get(message.id);
            if (callback) {
                this.callbacks.delete(message.id);
                if (message.error) {
                    callback.reject(new Error(message.error.message));
                } else {
                    callback.resolve(message.result);
                }
            }
        } else {
            if (message.sessionId) {
                this.emit(`session-${message.sessionId}-${message.method}`, message.params);
            } else {
                // This is an event emitted by the browser (no id)
                // Example: {method: "Target.targetCreated", params: {...}}
                this.emit(message.method, message.params);
            }
        }
    }

    // The core method to send any CDP command
    public send(method: string, params: object = {}, sessionId?: string): Promise<any> {
        const id = ++this.lastId;
        const messageObj: any = { id, method, params };

        if (sessionId) {
            messageObj.sessionId = sessionId;
        }
        const message = JSON.stringify(messageObj);

        return new Promise((resolve, reject) => {
            this.callbacks.set(id, { resolve, reject });
            this.ws.send(message, (error) => {
                if (error) {
                    this.callbacks.delete(id);
                    reject(error);
                }
            });
        });
    }

    public close() {
        this.ws.close();
    }

}