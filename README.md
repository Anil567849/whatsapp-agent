## Welcome to WhatsApp Agent.
Whatsapp Agent manages customers from start to finish, learning from every conversation to enhance sales and customer service.

You can utilize this framework to build your own products.

## Tech Stack Used
1. NodeJS
2. ExpressJS
3. Next.JS
4. Ngrok
5. Git
6. WhatsApp Webhooks
7. OpenAI API

## Step To Use

### 1: Clone the repo
``` bash
git clone https://github.com/Anil567849/whatsapp-agent.git
```

### 2: Install the dependencies
``` bash
cd api-server && npm i
cd ../agent-server && npm i
```

## About Environment Variables
### 1: Add environment variables
Create .env file in both folders

Under api-server/.env add these variables
``` bash
WHATSAPP_TOKEN=
WHATSAPP_MYTOKEN=
BASE_URL=
```

Under agent-server/.env add these variables
``` bash
OPENAI_API_KEY=
DATABASE_URL=
```

### 2: How to get WHATSAPP_TOKEN
visit this url and create whatsapp app
``` bash
https://developers.facebook.com/apps/
```

Configuration: 
Callback URL is your domain/api/webhook
Verify token is your WHATSAPP_MYTOKEN [It could be any secured string]
<img width="973" alt="image" src="https://github.com/user-attachments/assets/befa5916-615e-4b26-a6b7-06147f7e4788" />

Choose Subscription
<img width="958" alt="image" src="https://github.com/user-attachments/assets/a2d4900f-1fd0-4b9e-8b41-7f704a444b99" />

Set Phone Number 
<img width="957" alt="image" src="https://github.com/user-attachments/assets/bd7587e8-8f2f-4507-871e-2a59fe2d6a8e" />

Get Token
<img width="973" alt="image" src="https://github.com/user-attachments/assets/1d975967-bd70-4c44-8a9b-205754ac8173" />



### 3: How to get OPENAI_API_KEY
visit this url
``` bash
https://platform.openai.com/docs/overview
```
### 4: How to get DATABASE_URL
visit this url and create a postgres database
``` bash
https://supabase.com/
```

Get direct url
<img width="1008" alt="image" src="https://github.com/user-attachments/assets/8ed9daae-b225-4beb-a8b0-f4c12d8b2778" />


### 5. How to get BASE_URL
#### If your backend is deployed then use that url as a BASE_URL.
Otherwise if you don't want to deploy your backend you can utilize Ngrok.

visit this url and get your token
``` bash
https://ngrok.com/docs/getting-started/
```

For Mac
``` bash
brew install ngrok
ngrok config add-authtoken <TOKEN>
ngrok http http://localhost:8000
```

Make your sure localhost:8000 is running as well

Now use ngrok url as a BASE_URL.
example: https://4fd6-33ds-asdf-ef23-sdrf-e033-db84-31f4-1ged.ngrok-free.app




## Code Overview
Here you will receive all the messages and using AI Agent you can reply them
``` bash
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
```


Here is how Agent will handle requests
``` bash
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
```







