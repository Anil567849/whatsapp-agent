"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultDict = createDefaultDict;
// In this case, defaultdict(string) means that any missing key will default to an empty string ("") when accessed. It will not throw erorr.
function createDefaultDict(defaultValue, initialData = {}) {
    return new Proxy(initialData, {
        get(target, key) {
            return key in target ? target[key] : defaultValue;
        },
    });
}
