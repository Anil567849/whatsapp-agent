"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.Agent = void 0;
class Agent {
    constructor({ name = "Agent", model = "gpt-4o-mini-2024-07-18", instructions = "You are a helpful agent.", tool_choice = "auto", functions = [], parallel_tool_calls = true, } = {}) {
        this.name = name;
        this.model = model;
        this.instructions = instructions; // Ensure fallback to string
        this.tool_choice = tool_choice;
        this.functions = functions;
        this.parallel_tool_calls = parallel_tool_calls;
    }
}
exports.Agent = Agent;
class Result {
    constructor(value = "", agent) {
        /*
        Encapsulates the possible return values for an agent function.
      
        Attributes:
            value (string): The result value as a string.
            agent (Agent | null | undefined): The agent instance, if applicable.
        */
        this.value = "";
        this.agent = null;
        this.value = value;
        this.agent = agent;
    }
}
exports.Result = Result;
