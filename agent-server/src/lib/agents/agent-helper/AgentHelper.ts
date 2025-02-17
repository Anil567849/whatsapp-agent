import { StringAI } from "../../../stringai/stringai";
import { Agent, AgentResponse } from "../../../stringai/types";
import { DatabaseHelper } from "../../database";
import { CashierAgent, restaurantAgentMap } from "../main/restaurant";

const client = new StringAI();

export class AgentHelper{

    static async getResponseFromAgent({messaging_product, owner_phone, customer_phone, customer_message}: {messaging_product: string, owner_phone: string, customer_phone: string, customer_message: string}): Promise<{currentMessageResponse: string, nextAgent: Agent}> {

        try {
            const currentMessage: any = {role: 'user', content: customer_message};

            const {previousConversation, lastAgent}: {previousConversation: { role: "user" | "assistant", content: string }[], lastAgent: Agent} = await DatabaseHelper.getPreviousConversation(owner_phone, customer_phone);

            let startingAgent: Agent;
            if(previousConversation.length == 0){
                // startingAgent = new Agent();
                startingAgent = CashierAgent;
            }else{
                startingAgent = restaurantAgentMap.get(lastAgent.name) || CashierAgent;
            }

            let messages: any[] = [...previousConversation, currentMessage];
        
            const response: AgentResponse = await client.main({
                agent: startingAgent,
                messages,
            });
        
            let nextAgent: Agent;
            if(response.agent){
                nextAgent = response.agent;
            }else{
                nextAgent = startingAgent;
            }
        
            const currentMessageResponse: string = response.messages[response.messages.length - 1]?.content;

            return {currentMessageResponse, nextAgent};
            
        } catch (error) {
            throw new Error(`Error sending message to agent: ${error}`);
        }
    }

}