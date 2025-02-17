import { Agent } from "../../stringai/types";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export class DatabaseHelper {

    static async storeConversation(owner_phone: string, customer_phone: string, conversation: { role: string, content: string }[], agent: Agent): Promise<void> {

        try {
            // first check if owner_phone exist in database
            const ownerExist = await DatabaseHelperUtils.checkExist(owner_phone);

            if (!ownerExist) {
                await DatabaseHelperUtils.createOwner(owner_phone);
                await DatabaseHelperUtils.createCustomer(owner_phone, customer_phone, conversation, agent);
            } else {
                // check if customer_phone exist under owner
                const customerExist = await prisma.customer.findUnique({
                    where: {
                        ownerPhoneNumber: owner_phone,
                        phoneNumber: customer_phone
                    }
                });

                if (!customerExist) {
                    await DatabaseHelperUtils.createCustomer(owner_phone, customer_phone, conversation, agent);
                } else {
                    await DatabaseHelperUtils.storeConversation(customer_phone, conversation, agent);
                }
            }

        } catch (error) {
            throw new Error(`Error storing conversation to database: ${error}`);
        }
    }

    static async getPreviousConversation(owner_phone: string, customer_phone: string): Promise<any> {
        try {

            // Directly query Conversation with nested filtering:
            const conversations = await prisma.conversation.findMany({
                where: {
                    customer: {
                        phoneNumber: customer_phone,
                        owner: {
                            phoneNumber: owner_phone,
                        },
                    },
                },
            });

            // Convert messages to a flat array: 1D array of messages
            const allMessages = conversations.flatMap(conversation => {
                let messagesArray = [];
                if (typeof conversation.messages === 'string') {
                    try {
                        messagesArray = JSON.parse(conversation.messages);
                    } catch (error) {
                        console.error('Error parsing messages JSON:', error);
                        messagesArray = [];
                    }
                } else if (Array.isArray(conversation.messages)) {
                    messagesArray = conversation.messages;
                }
                return messagesArray;
            });

            //   Get Agent from the last conversation:
            const lastConversation = conversations[conversations.length - 1];
            let lastAgent = lastConversation?.agent; // might be a JSON string or object

            // Convert to object if necessary:
            if (typeof lastAgent === 'string') {
                try {
                    lastAgent = JSON.parse(lastAgent);
                } catch (error) {
                    console.error('Error parsing agent JSON:', error);
                    lastAgent = null; // or handle the error appropriately
                }
            }

            /*
                All Messages
                [
                    { role: 'user', content: 'Hi' },
                    { role: 'assistant', content: 'Hello! How can I assist you today?' }
                    { role: 'user', content: 'Hello, My name is Anil' }
                    { role: 'assistant', content: 'Hello! How can I assist you Anil?' }
                ]
            */
            return { previousConversation: allMessages, lastAgent };

        } catch (error) {
            throw new Error(`Error getting previous conversation from database: ${error}`);
        }
    }

}


class DatabaseHelperUtils {

    static async checkExist(phoneNumber: string): Promise<boolean> {
        const result = await prisma.owner.findUnique({
            where: {
                phoneNumber
            }
        });
        return result !== null;
    }

    static async createOwner(phoneNumber: string): Promise<void> {
        try {
            await prisma.owner.create({
                data: {
                    phoneNumber
                }
            });
        } catch (error) {
            throw new Error(`Error creating owner: ${error}`);
        }
    }

    static async createCustomer(owner_phone: string, phoneNumber: string, conversation: { role: string, content: string }[], agent: Agent): Promise<void> {
        try {
            await prisma.customer.create({
                data: {
                    phoneNumber,
                    owner: {
                        connect: {
                            phoneNumber: owner_phone
                        }
                    },
                    conversations: {
                        create: {
                            messages: conversation.map(msg => ({
                                role: msg.role,
                                content: msg.content
                            })),
                            agent: JSON.stringify(agent)
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Error creating customer: ${error}`);
        }
    }

    static async storeConversation(customer_phone: string, conversation: { role: string, content: string }[], agent: Agent): Promise<void> {
        try {
            await prisma.conversation.create({
                data: {
                    customer: {
                        connect: {
                            phoneNumber: customer_phone
                        }
                    },
                    messages: conversation.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    agent: JSON.stringify(agent)
                }
            });
        } catch (error) {
            throw new Error(`Error storing conversation: ${error}`);
        }
    }

}