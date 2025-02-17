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
exports.DatabaseHelper = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DatabaseHelper {
    static storeConversation(owner_phone, customer_phone, conversation, agent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // first check if owner_phone exist in database
                const ownerExist = yield DatabaseHelperUtils.checkExist(owner_phone);
                if (!ownerExist) {
                    yield DatabaseHelperUtils.createOwner(owner_phone);
                    yield DatabaseHelperUtils.createCustomer(owner_phone, customer_phone, conversation, agent);
                }
                else {
                    // check if customer_phone exist under owner
                    const customerExist = yield prisma.customer.findUnique({
                        where: {
                            ownerPhoneNumber: owner_phone,
                            phoneNumber: customer_phone
                        }
                    });
                    if (!customerExist) {
                        yield DatabaseHelperUtils.createCustomer(owner_phone, customer_phone, conversation, agent);
                    }
                    else {
                        yield DatabaseHelperUtils.storeConversation(customer_phone, conversation, agent);
                    }
                }
            }
            catch (error) {
                throw new Error(`Error storing conversation to database: ${error}`);
            }
        });
    }
    static getPreviousConversation(owner_phone, customer_phone) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Directly query Conversation with nested filtering:
                const conversations = yield prisma.conversation.findMany({
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
                        }
                        catch (error) {
                            console.error('Error parsing messages JSON:', error);
                            messagesArray = [];
                        }
                    }
                    else if (Array.isArray(conversation.messages)) {
                        messagesArray = conversation.messages;
                    }
                    return messagesArray;
                });
                //   Get Agent from the last conversation:
                const lastConversation = conversations[conversations.length - 1];
                let lastAgent = lastConversation === null || lastConversation === void 0 ? void 0 : lastConversation.agent; // might be a JSON string or object
                // Convert to object if necessary:
                if (typeof lastAgent === 'string') {
                    try {
                        lastAgent = JSON.parse(lastAgent);
                    }
                    catch (error) {
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
            }
            catch (error) {
                throw new Error(`Error getting previous conversation from database: ${error}`);
            }
        });
    }
}
exports.DatabaseHelper = DatabaseHelper;
class DatabaseHelperUtils {
    static checkExist(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield prisma.owner.findUnique({
                where: {
                    phoneNumber
                }
            });
            return result !== null;
        });
    }
    static createOwner(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.owner.create({
                    data: {
                        phoneNumber
                    }
                });
            }
            catch (error) {
                throw new Error(`Error creating owner: ${error}`);
            }
        });
    }
    static createCustomer(owner_phone, phoneNumber, conversation, agent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.customer.create({
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
            }
            catch (error) {
                throw new Error(`Error creating customer: ${error}`);
            }
        });
    }
    static storeConversation(customer_phone, conversation, agent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.conversation.create({
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
            }
            catch (error) {
                throw new Error(`Error storing conversation: ${error}`);
            }
        });
    }
}
