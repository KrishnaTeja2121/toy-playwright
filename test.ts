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

        // Let's use a real public form testing site
        await page.goto("https://www.w3schools.com/html/tryit.asp?filename=tryhtml_button_onclick");

        // The W3Schools editor has an iframe named "iframeResult". Try to find the button inside it.
        console.log("Looking for the 'Click Me!' button...");

        const buttonHandle = await page.$('#iframeResult');

        if (buttonHandle) {
            console.log("Found the iframe! Calculating position and clicking...");
            // We're clicking the iframe for simplicity in this sandbox, which should focus it.
            // On a normal site without nested iframes, you could just do page.$('button')
            await buttonHandle.click();
            await new Promise(r => setTimeout(r, 1000));
            console.log("Mission accomplished!");
        } else {
            console.log("Element not found.");
        }

        await page.screenshot('final-test.png');

        browser.close();
    } finally {
        launcher.close();
    }
}

main().catch(console.error);
