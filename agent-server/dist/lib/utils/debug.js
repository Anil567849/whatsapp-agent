"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug_print = debug_print;
function debug_print(...args) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19); // Format like "YYYY-MM-DD HH:mm:ss"
    const message = args.join(' ');
    console.log(`\x1b[97m[ \x1b[90m${timestamp}\x1b[97m] \x1b[90m${message}\x1b[0m`);
}
