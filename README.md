# Toy Playwright

A from-scratch, educational implementation of a browser automation framework (similar to Playwright or Puppeteer) written in Node.js and TypeScript. 

This project was built to understand the underlying mechanics of modern web testing tools. Rather than using external libraries or wrappers, we communicate directly with the browser's raw debugging port.

## How it Works: The Architecture

Under the hood, Playwright isn't magic. It operates on a **Client-Server model**:

1. **Process Management**: We use Node's `child_process` to spawn a local installation of Microsoft Edge (or Google Chrome) with the `--remote-debugging-port=0` flag. This forces the browser to open a WebSocket server.
2. **Chrome DevTools Protocol (CDP)**: We establish a WebSocket connection to the browser. We then communicate using the **CDP**, which is a strict JSON-RPC protocol.
3. **Session Routing**: A browser has multiple Tabs (Targets). We attach to a specific Target to receive a `sessionId`. Every subsequent command we send to the browser includes this ID so the browser knows which tab should execute the command.

## Features Implemented

Through this exercise, we built several core abstractions that mirror the real Playwright codebase:

* **Browser & Page Abstractions**: High-level wrappers (`browser.newPage()`, `page.goto()`) around the raw CDP WebSocket connection.
* **JavaScript Evaluation**: Using the `Runtime.evaluate` CDP domain to execute custom JavaScript strings directly inside the browser tab's memory space and return the values.
* **Screenshots**: Interacting with the `Page.captureScreenshot` domain to capture Base64 encoded PNGs of the viewport.
* **Locators and Element Handles**: Bypassing brittle DOM Javascript injections! Instead, we use `Runtime.evaluate` to return an `objectId` (a memory pointer to the DOM node). We then pass this pointer to `DOM.getBoxModel` to ask the browser to calculate the exact pixel coordinates and screen layout of the element.
* **Emulated Synthetic Inputs**: Once we calculate an element's bounding box center, we use the `Input.dispatchMouseEvent` domain to generate true OS-level emulated hardware clicks (synthesizing `mousePressed` and `mouseReleased` events).

## Getting Started

### Prerequisites
- Node.js (v16+)
- Microsoft Edge installed (or update `src/launcher.ts` with your Chrome executable path)

### Installation
```bash
npm install
```

### Running the Test Script
We have a comprehensive end-to-end test script that demonstrates everything we built. It will:
1. Launch the browser
2. Open a new tab
3. Navigate to a w3schools interactive sandbox
4. Search the DOM for a specific button inside an iframe
5. Calculate the button's screen coordinates
6. Perform a physical, emulated click
7. Wait, and capture a screenshot of the result

```bash
npx ts-node test.ts
```

Check your project folder for `before-click.png` and `final-test.png` to see the automated actions!

## Journey Phases

We built this step-by-step in 7 phases:
1. Foundation & Architecture
2. Process Management (`BrowserLauncher`)
3. Protocol Connection (`Connection` JSON-RPC client)
4. High-Level API (`Browser` & `Page`)
5. Core Automation Features (`goto`, `evaluate`, `screenshot`)
6. Real Emulated Interactions (`Mouse` class)
7. Locators and ElementHandles (`ElementHandle` class)
