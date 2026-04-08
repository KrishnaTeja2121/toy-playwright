import { Connection } from "./connection";
import { Mouse } from "./mouse";

export class ElementHandle {
    constructor(
        private connection: Connection,
        private sessionId: string,
        private mouse: Mouse,
        private objectId: string// This is a special ID pointing to the DOM Element in Chrome's memory
    ) { }

    private send(method: string, params: object = {}) {
        return this.connection.send(method, params, this.sessionId);
    }

    // 1. Ask the browser for the exact layout metrics of this specific element

    public async boundingBox() {
        // First we must enable the DOM domain to get box models
        await this.send('DOM.enable');
        const response = await this.send('DOM.getBoxModel', {
            objectId: this.objectId
        });

        if (!response.model) return null;

        // The content box is returned as an array of 8 coordinates: 
        // [x1, y1, x2, y2, x3, y3, x4, y4]
        // representing the 4 corners of the element.
        const [x0, y0, , , x2, y2] = response.model.content;

        return {
            x: x0,
            y: y0,
            width: x2 - x0,
            height: y2 - y0
        };
    }

    // 2. Automatically calculate the center and perform a physical click

    public async click() {
        const box = await this.boundingBox();
        if (!box) throw new Error("Element is not visible or has no bounding box");

        // Find the absolute center of the element
        const centerX = box.x + (box.width / 2);
        const centerY = box.y + (box.height / 2);

        console.log(`Resolved element to center coordinates: [${centerX}, ${centerY}].
            Commencing physical click...`);

        await this.mouse.click(centerX, centerY);
    }
}