"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionToJson = functionToJson;
const typeMap = {
    'String': 'string',
    'Number': 'number',
    'Boolean': 'boolean',
    'Array': 'array',
    'Object': 'object',
    'null': 'null',
};
function functionToJson(func) {
    try {
        // Get function metadata using reflection
        const funcString = func.toString();
        const parameters = {};
        const required = [];
        // Parse function parameters from the function string
        const paramMatch = funcString.match(/\((.*?)\)/);
        if (paramMatch) {
            const params = paramMatch[1].split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            params.forEach(param => {
                const [paramName] = param.split(':');
                parameters[paramName] = { type: 'string' }; // Default to string as TS types are erased at runtime
                required.push(paramName);
            });
        }
        const id = (Math.random() * 10000).toString();
        return {
            type: 'function',
            function: {
                name: func.name,
                description: "desc",
                parameters: {
                    type: 'object',
                    properties: parameters,
                    required: required
                }
            }
        };
    }
    catch (e) {
        throw new Error(`Failed to get signature for function ${func.name}: ${e.message}`);
    }
}
