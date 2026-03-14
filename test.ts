import { BrowserLauncher } from "./src/launcher";

async function main() {
    const launcher = new BrowserLauncher();
    try {
        const wsEndpoint = await launcher.launch();
        console.log(`Success ! Connected to browser at ${wsEndpoint}`);

        await new Promise(r => setTimeout(r, 3000));
    }
    finally {
        launcher.close();
    }
}
main().catch(console.error);