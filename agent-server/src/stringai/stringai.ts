import OpenAI from "openai";
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources";
import { Agent, AgentFunction, IChatMessage, AgentResponse, Result, ReturnAgentFunction } from "./types";
import { functionToJson } from "../lib/utils/function_to_json";
import { IContextVariables } from "./types";
import { createDefaultDict } from "../lib/utils/defaultDict";

export class StringAI {

    private client: OpenAI | null = null;

    constructor() {
        if (!this.client) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY as string
            });
        }
    }

    public async main({agent, messages, contextVariables = {}, modelOverride = null, maxTurns = 20, executeTools = true}: {agent: Agent, messages: IChatMessage[], contextVariables?: IContextVariables, modelOverride?: string | null, maxTurns?: number, executeTools?: boolean}): Promise<AgentResponse> {

        let currentAgent: Agent = agent;
        const initialLen = messages.length;
        let history: IChatMessage[] = JSON.parse(JSON.stringify(messages)); // deep copy
        let contextVariablesDeepCopy: IContextVariables = JSON.parse(JSON.stringify(contextVariables)); // deep copy

        while ((history.length - initialLen < maxTurns) && currentAgent) {
            console.log('Agent', currentAgent.name);
            let completion: ChatCompletion = await this.chatCompletion({agent: currentAgent, modelOverride, history, contextVariables: contextVariablesDeepCopy});
            let message: IChatMessage = completion.choices[0].message;

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
            } else {
                // handle function calls, and switching agents [Todo:  add context_variables]
                let partial_response: AgentResponse = this.handleToolCalls(message.tool_calls, currentAgent.functions);

                // Add all tool response messages to history
                if (partial_response.messages) {
                    history.push(...partial_response.messages);
                }
                
                if (partial_response.agent) {
                    currentAgent = partial_response.agent;
                }
            }
        }

        const res: AgentResponse = {
            messages: history.slice(initialLen), // [msg1, msg2, msg3, msg4] only remove old msg eg: msg1 and msg2 if initialLen is 2
            agent: currentAgent,
        }

        return res;
    }

    private async chatCompletion({agent, modelOverride, history, contextVariables}: {agent: Agent, modelOverride: string | null, history: IChatMessage[], contextVariables: IContextVariables}): Promise<ChatCompletion> {

        if (!this.client) {
            throw new Error("Client is not initialized");
        }

        contextVariables = createDefaultDict("", contextVariables);

        let instructions: string = "";
        if (typeof agent.instructions === 'function') {
            instructions = agent.instructions(contextVariables);          
        }else{
            instructions = agent.instructions;
        }

        let messages: ChatCompletionMessageParam[] = [{ role: "system", content: instructions }, ...history];

        const tools = agent.functions.map((f: AgentFunction) => functionToJson(f));

        // if tools are there then call them parallelly
        let createParams: ChatCompletionCreateParamsNonStreaming | null = null;

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
        } else {
            // Create parameters for the chat completion
            createParams = {
                model: modelOverride || agent.model,
                messages,
            }
        }

        try {
            // Call the chat completion API
            return await this.client?.chat.completions.create(createParams);
        } catch (error) {
            throw new Error(`Error in Chat Completion: ${error}`);
        }

    }

    private handleToolCalls(toolCalls: ChatCompletionMessageToolCall[], agentFunctions: AgentFunction[]): AgentResponse {

        // Creating Map
        const functionMap: Record<string, AgentFunction> = {};

        agentFunctions.forEach((f: AgentFunction) => {
            const name: string = f.name; // function name [note: only use named function to get name]
            functionMap[name] = f;
        });

        const partialResponse: AgentResponse = {
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
                const rawResult: ReturnAgentFunction = func(...Object.values(args) as string[]);

                // check is it final result or do we need to seek help of another agent
                const result: Result = this.handleFunctionResult(rawResult);

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
            } catch (error) {
                console.error('Error parsing or validating arguments:', error);
            }
        }

        return partialResponse;
    }

    private handleFunctionResult(rawResult: ReturnAgentFunction): Result {

        if (rawResult instanceof Result) {
            return rawResult; // If it's an instance of Result, return as is
        } else if (rawResult instanceof Agent) {
            return new Result(
                JSON.stringify({ assistant: rawResult.name }),
                rawResult
            ); // If it's an instance of Agent, return a Result with agent information
        } else {
            try {
                return new Result(String(rawResult)); // Attempt to convert result to string and return it in a Result object
            } catch (e) {
                const errorMessage = `Failed to cast response to string: ${rawResult}. Make sure agent functions return a string or Result object. Error: ${e instanceof Error ? e.message : e}`;
                console.log(errorMessage);
                throw new TypeError(errorMessage);
            }
        }

    }

}