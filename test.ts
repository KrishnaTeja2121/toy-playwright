import { BrowserLauncher } from "./src/launcher";
import { Connection } from "./src/connection";
import { Browser } from "./src/browser";

async function main() {
    const launcher = new BrowserLauncher();
    try {
        const wsEndpoint = await launcher.launch();
        const connection = new Connection(wsEndpoint);
        await connection.connect();

        const browser = new Browser(connection);
        const page = await browser.newPage();

        await page.goto("about:blank"); // Start with a blank page

        // --- THE SETUP ---
        // We draw a huge red box starting at x:100, y:100
        await page.evaluate(() => {
            const box = document.createElement('div');
            box.style.width = '200px';
            box.style.height = '200px';
            box.style.backgroundColor = 'red';
            box.style.position = 'absolute';
            box.style.left = '100px';
            box.style.top = '100px';
            box.innerText = "Click Me!";

            // Set up a physical click detector!
            box.addEventListener('click', () => {
                box.style.backgroundColor = 'green';
                box.innerText = "Wow, I got clicked!";
            });
            document.body.appendChild(box);
        });

        // Look at it before we click
        await page.screenshot('before-click.png');

        // --- THE CLICK ---
        // Click directly on coordinates x:150, y:150 (right in the middle of our box)
        await page.mouse.click(150, 150);

        // Wait a tiny bit for the browser to render the green box
        await new Promise(r => setTimeout(r, 100));

        // Let's capture the proof that the synthetic click fired the event listener!
        await page.screenshot('after-click.png');
        console.log("Look at after-click.png to see the box turned green!");

        browser.close();
    } finally {
        launcher.close();
    }
}

main().catch(console.error);
