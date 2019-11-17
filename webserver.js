/*
 * Simple (mostly) static file server for the web app.
 */
const express = require('express');
const process = require('process');

let _rejectCount = 0;
process.on('unhandledrejection', ev => {
    console.error(ev);
    if (_rejectCount++ > 100) {
        console.error("Reject count too high, killing process.");
        process.exit(1);
    }
});

const PORT = Number(process.env.PORT) || 3600;

async function main() {
    const root = `${__dirname}`;
    const app = express();
    app.use(express.static(root));
    app.listen(PORT);
}

main();
