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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentHelper = void 0;
const stringai_1 = require("../../../stringai/stringai");
const database_1 = require("../../database");
const restaurant_1 = require("../main/restaurant");
const client = new stringai_1.StringAI();
class AgentHelper {
    static getResponseFromAgent(_a) {
        return __awaiter(this, arguments, void 0, function* ({ messaging_product, owner_phone, customer_phone, customer_message }) {
            var _b;
            try {
                const currentMessage = { role: 'user', content: customer_message };
                const { previousConversation, lastAgent } = yield database_1.DatabaseHelper.getPreviousConversation(owner_phone, customer_phone);
                let startingAgent;
                if (previousConversation.length == 0) {
                    // startingAgent = new Agent();
                    startingAgent = restaurant_1.CashierAgent;
                }
                else {
                    startingAgent = restaurant_1.restaurantAgentMap.get(lastAgent.name) || restaurant_1.CashierAgent;
                }
                let messages = [...previousConversation, currentMessage];
                const response = yield client.main({
                    agent: startingAgent,
                    messages,
                });
                let nextAgent;
                if (response.agent) {
                    nextAgent = response.agent;
                }
                else {
                    nextAgent = startingAgent;
                }
                const currentMessageResponse = (_b = response.messages[response.messages.length - 1]) === null || _b === void 0 ? void 0 : _b.content;
                return { currentMessageResponse, nextAgent };
            }
            catch (error) {
                throw new Error(`Error sending message to agent: ${error}`);
            }
        });
    }
}
exports.AgentHelper = AgentHelper;
