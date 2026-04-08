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

        // 1. Navigate and WAIT for the page to load
        await page.goto("https://news.ycombinator.com/");

        // 2. Evaluate JavaScript inside the browser to extract data
        const topStoryTitle = await page.evaluate(() => {
            // This code runs inside the browser, so we have access to `document`!
            const firstTitleElement = document.querySelector('.titleline > a');
            return firstTitleElement ? firstTitleElement.textContent : 'No title found';
        });

        console.log('--- EXECUTED JS IN BROWSER ---');
        console.log('Top Story on Hacker News:', topStoryTitle);
        console.log('------------------------------');

        // 3. Take a screenshot
        await page.screenshot('hackernews.png');

        browser.close();
    } finally {
        launcher.close();
    }
}

main().catch(console.error);
