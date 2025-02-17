"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringAI = void 0;
const openai_1 = __importDefault(require("openai"));
const types_1 = require("./types");
const function_to_json_1 = require("../lib/utils/function_to_json");
const defaultDict_1 = require("../lib/utils/defaultDict");
class StringAI {
    constructor() {
        this.client = null;
        if (!this.client) {
            this.client = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }
    main(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agent, messages, contextVariables = {}, modelOverride = null, maxTurns = 20, executeTools = true }) {
            let currentAgent = agent;
            const initialLen = messages.length;
            let history = JSON.parse(JSON.stringify(messages)); // deep copy
            let contextVariablesDeepCopy = JSON.parse(JSON.stringify(contextVariables)); // deep copy
            while ((history.length - initialLen < maxTurns) && currentAgent) {
                console.log('Agent', currentAgent.name);
                let completion = yield this.chatCompletion({ agent: currentAgent, modelOverride, history, contextVariables: contextVariablesDeepCopy });
                let message = completion.choices[0].message;
                /*
                    Received completion: {
                    role: 'assistant',
                    content: 'Hello! How can I assist you today?',
                    refusal: null
                    }
                */
                message.sender = currentAgent.name;
                history.push(message);
                if (!message.tool_calls || !executeTools) {
                    console.log("no more tools to excute");
                    break;
                }
                else {
                    // handle function calls, and switching agents [Todo:  add context_variables]
                    let partial_response = this.handleToolCalls(message.tool_calls, currentAgent.functions);
                    // Add all tool response messages to history
                    if (partial_response.messages) {
                        history.push(...partial_response.messages);
                    }
                    if (partial_response.agent) {
                        currentAgent = partial_response.agent;
                    }
                }
            }
            const res = {
                messages: history.slice(initialLen), // [msg1, msg2, msg3, msg4] only remove old msg eg: msg1 and msg2 if initialLen is 2
                agent: currentAgent,
            };
            return res;
        });
    }
    chatCompletion(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agent, modelOverride, history, contextVariables }) {
            var _b;
            if (!this.client) {
                throw new Error("Client is not initialized");
            }
            contextVariables = (0, defaultDict_1.createDefaultDict)("", contextVariables);
            let instructions = "";
            if (typeof agent.instructions === 'function') {
                instructions = agent.instructions(contextVariables);
            }
            else {
                instructions = agent.instructions;
            }
            let messages = [{ role: "system", content: instructions }, ...history];
            const tools = agent.functions.map((f) => (0, function_to_json_1.functionToJson)(f));
            // if tools are there then call them parallelly
            let createParams = null;
            if (tools.length > 0) {
                // Create parameters for the chat completion
                createParams = {
                    model: modelOverride || agent.model,
                    messages,
                    /*
                    A list of tools the model may call. Currently, only functions are supported as a
                    tool. Use this to provide a list of functions the model may generate JSON inputs
                    for. A max of 128 functions are supported.
                    */
                    tools: tools,
                    tool_choice: agent.tool_choice,
                };
                createParams["parallel_tool_calls"] = agent.parallel_tool_calls;
            }
            else {
                // Create parameters for the chat completion
                createParams = {
                    model: modelOverride || agent.model,
                    messages,
                };
            }
            try {
                // Call the chat completion API
                return yield ((_b = this.client) === null || _b === void 0 ? void 0 : _b.chat.completions.create(createParams));
            }
            catch (error) {
                throw new Error(`Error in Chat Completion: ${error}`);
            }
        });
    }
    handleToolCalls(toolCalls, agentFunctions) {
        // Creating Map
        const functionMap = {};
        agentFunctions.forEach((f) => {
            const name = f.name; // function name [note: only use named function to get name]
            functionMap[name] = f;
        });
        const partialResponse = {
            messages: [],
            agent: null,
        };
        for (const toolCall of toolCalls) {
            const name = toolCall.function.name;
            // Handle missing tool case, skip to next tool
            if (!(name in functionMap)) {
                console.log(`Tool ${name} not found in function map.`);
                partialResponse.messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    tool_name: name,
                    content: `Error: Tool ${name} not found.`,
                });
                continue;
            }
            try {
                // Parse the JSON string [get all the arguments]
                const args = JSON.parse(toolCall.function.arguments);
                // console.log(`Processing tool call: ${name} with arguments`, args);
                // get our helper or external functions and call that with args
                const func = functionMap[name];
                // Todo: Pass context_variables to agent functions
                // if (__CTX_VARS_NAME__ in func.length) {
                //   args[__CTX_VARS_NAME__] = contextVariables;
                // }
                // Todo: Check func if async or not then use await
                const rawResult = func(...Object.values(args));
                // check is it final result or do we need to seek help of another agent
                const result = this.handleFunctionResult(rawResult);
                partialResponse.messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    tool_name: name,
                    content: result.value,
                });
                // Todo: Add context variables to the response
                //   partialResponse.context_variables = {
                //     ...partialResponse.context_variables,
                //     ...result.context_variables,
                //   };
                if (result.agent) { // yes we need to seek help from another agent
                    partialResponse.agent = result.agent;
                }
            }
            catch (error) {
                console.error('Error parsing or validating arguments:', error);
            }
        }
        return partialResponse;
    }
    handleFunctionResult(rawResult) {
        if (rawResult instanceof types_1.Result) {
            return rawResult; // If it's an instance of Result, return as is
        }
        else if (rawResult instanceof types_1.Agent) {
            return new types_1.Result(JSON.stringify({ assistant: rawResult.name }), rawResult); // If it's an instance of Agent, return a Result with agent information
        }
        else {
            try {
                return new types_1.Result(String(rawResult)); // Attempt to convert result to string and return it in a Result object
            }
            catch (e) {
                const errorMessage = `Failed to cast response to string: ${rawResult}. Make sure agent functions return a string or Result object. Error: ${e instanceof Error ? e.message : e}`;
                console.log(errorMessage);
                throw new TypeError(errorMessage);
            }
        }
    }
}
exports.StringAI = StringAI;
