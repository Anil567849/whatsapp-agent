import { NextRequest, NextResponse } from 'next/server';

const token = process.env.WHATSAPP_TOKEN as string;
const mytoken = process.env.WHATSAPP_MYTOKEN as string;
const BASE_URL = process.env.BASE_URL as string;

class WhatsAppHelper {
    static async sendMsgToUser(phon_no_id: string, from: string, agentReply: string) {
        try {
            await fetch(`https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: agentReply
                    }
                })
            });
        } catch (error) {
            throw new Error(`Error sending message to user: ${error}`);
        }
    }

    // static async saveCustomerData(phon_no_id: string, from: string, msg_body: string) {

    // }
}

class AgentHelper {
    static async sendMsgToAgent(phon_no_id: string, from: string, msg_body: string) {

        try {

            const response = await fetch(`${BASE_URL}/api/agent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    owner_phone: from,
                    customer_phone: phon_no_id,
                    customer_message: msg_body
                })
            });

            const data = await response.json();
            
            console.log('data:', data);

            return data.message;
            
        } catch (error) {
            throw new Error(`Error sending message to agent: ${error}`);
        }
    }
}

/*
This GET function is used to verify the webhook URL. When we create a webhook, Facebook sends a GET request to the webhook URL with some query parameters. We need to verify the webhook URL by checking the query parameters and sending a response with the challenge parameter.
*/
export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const challange = req.nextUrl.searchParams.get("hub.challenge");
    const verify_token = req.nextUrl.searchParams.get("hub.verify_token");

    // console.log(mode, challange, verify_token);

    if (mode && verify_token) {
        if (mode === "subscribe" && verify_token === mytoken) {
            return new NextResponse(challange, { status: 200 });
        }
    }
    return new NextResponse(null, { status: 403 });
}

/* 
This POST function is used to receive messages from the customer. When a customer sends a message, Facebook sends a POST request to the webhook URL with the message data. We need to extract the message data from the request body and send a response with status 200.

We can reply back to customer messages by sending a POST request to the Facebook API with the customer phone number and message data. URL: https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}
*/
export async function POST(req: NextRequest) {

    try {
        const body_param = await req.json();

        if (!body_param || !body_param.object) {
            return new NextResponse("Invalid request body", { status: 400 });
        }

        const entry = body_param.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const messages = value?.messages?.[0];

        if (messages && value.metadata) {
            const phon_no_id = value.metadata.phone_number_id;
            const from = messages.from;
            const msg_body = messages.text?.body || "";

            // Ensure helper function calls are awaited correctly
            // await WhatsAppHelper.saveCustomerData(phon_no_id, from, msg_body);

            console.log('phon_no_id:', phon_no_id);

            const agentReply: string = await AgentHelper.sendMsgToAgent(phon_no_id, from, msg_body);

            await WhatsAppHelper.sendMsgToUser(phon_no_id, from, agentReply);

            console.log('Message sent successfully');

            return new NextResponse(null, { status: 200 });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}