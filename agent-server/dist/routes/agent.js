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
const express_1 = __importDefault(require("express"));
const AgentHelper_1 = require("../lib/agents/agent-helper/AgentHelper");
const database_1 = require("../lib/database");
const router = express_1.default.Router();
router.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from API server' });
});
router.post('/api/agent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // I will be using owner_phone and user_phone as a unique identifier to get previous conversation.
        const { messaging_product, owner_phone, customer_phone, customer_message } = req.body;
        const response = yield AgentHelper_1.AgentHelper.getResponseFromAgent({ messaging_product, owner_phone, customer_phone, customer_message });
        const storeToDatabase = [{ role: 'user', content: customer_message }, { role: 'assistant', content: response.currentMessageResponse }];
        yield database_1.DatabaseHelper.storeConversation(owner_phone, customer_phone, storeToDatabase, response.nextAgent);
        res.json({ message: response.currentMessageResponse });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
