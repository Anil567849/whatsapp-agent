import express from 'express';
import { AgentHelper } from '../lib/agents/agent-helper/AgentHelper';
import { Agent } from '../stringai/types';
import { DatabaseHelper } from '../lib/database';
const router = express.Router();

router.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from API server' });
});

router.post('/api/agent', async (req, res) => {

    try {

        // I will be using owner_phone and user_phone as a unique identifier to get previous conversation.
        const { messaging_product, owner_phone, customer_phone, customer_message } = req.body;

        const response: {currentMessageResponse: string, nextAgent: Agent} = await AgentHelper.getResponseFromAgent({messaging_product, owner_phone, customer_phone, customer_message});

        const storeToDatabase = [{role: 'user', content: customer_message}, {role: 'assistant', content: response.currentMessageResponse}];

        await DatabaseHelper.storeConversation(owner_phone, customer_phone, storeToDatabase, response.nextAgent);

        res.json({ message:  response.currentMessageResponse });

    }catch (error: any) {
        res.status(500).json({ message: error.message });
    }

});

export default router;