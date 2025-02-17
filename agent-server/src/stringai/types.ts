import { ChatCompletionMessage, ChatCompletionToolChoiceOption } from "openai/resources";

export type ReturnAgentFunction = string | Agent | Record<string, any>;

export interface AgentFunction {
    (...args: string[]): ReturnAgentFunction;
}

export type IInstruction = string | ((contextVar: IContextVariables) => string);

export interface AgentOptions {
    name?: string;
    model?: string;
    instructions?: IInstruction;
    tool_choice?: ChatCompletionToolChoiceOption;
    functions?: AgentFunction[];
    parallel_tool_calls?: boolean;
}

export class Agent {
    name: string;
    model: string;
    instructions: IInstruction;
    functions: AgentFunction[];
    parallel_tool_calls: boolean;
    // ['none: not call any func', 'auto: call one or more func', 'required: must call all func']. Specifying a particular tool via `{"type": "function", "function": {"name": "my_function"}}` forces the model to call that tool.
    tool_choice: ChatCompletionToolChoiceOption;

    constructor({
        name = "Agent",
        model = "gpt-4o-mini-2024-07-18",
        instructions = "You are a helpful agent.",
        tool_choice = "auto",
        functions = [],
        parallel_tool_calls = true,
    }: AgentOptions = {}) { // default value: {}
        this.name = name;
        this.model = model;
        this.instructions = instructions; // Ensure fallback to string
        this.tool_choice = tool_choice;
        this.functions = functions;
        this.parallel_tool_calls = parallel_tool_calls;
    }
}

export interface AgentResponse {
    messages: any[];
    agent?: Agent | null;
    // contextVariables: Record<string, any> = {};
}

export class Result {
    /*
    Encapsulates the possible return values for an agent function.
  
    Attributes:
        value (string): The result value as a string.
        agent (Agent | null | undefined): The agent instance, if applicable.
    */
  
    value: string = "";
    agent?: Agent | null = null;
  
    constructor(value: string = "", agent?: Agent | null) {
      this.value = value;
      this.agent = agent;
    }
}

export interface ParameterInfo {
    type: string;
}

export interface FunctionSignature {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, ParameterInfo>;
            required: string[];
        };
    };
}

export interface IChatMessage extends ChatCompletionMessage {
    sender?: string;
    tool_name?: string,
    tool_call_id?: string,
}

export interface IContextVariables {
    [key: string]: string; // Any key with a string value
}