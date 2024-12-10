// #############################################
// ###                                       ###
// ###          DISCLAIMER                   ###
// ###                                       ###
// #############################################

// The script "ollama.js" is provided as-is, without any warranties or guarantees of any kind.
// The creator of this script is not responsible for any damages or consequences arising from the use of this script. 
// Use it at your own risk.

// Description:
// "ollama.js" is a Node.js script designed for integrating the Ollama natural language processing (NLP) engine into WhatsApp chatbots. 
// It allows users to interact with Ollama-powered chatbots on the WhatsApp platform.

// Creator:
// This script was created by MaliosDark. For inquiries or support, please contact malios666@gmail.com.

// Instructions:
// 1. Before using the script, ensure that you have configured the required settings, including:
//    - Phone number associated with your WhatsApp session. line 33
//    - Configuration of the Ollama model, including language and prompt settings.
//    - Deleting the "!" it will alow you to freely chat to the bot.
//    - once started. the first message that every user send to the bot it would respond it with a 🤖.
//      ( this meaning that a private chat had been created and is ready to chat and remember the conversation from that specific user.
//      Maintaining the privacy on managing multiple chats with ollama.)
//    - Must Note that conversations are saved while the script is running, once restarted chats would start again with a 🤖 and no memory of conversations.

// 2. Make sure to handle any errors or exceptions that may occur during script execution.

// 3. Use this script responsibly and adhere to the terms of service of any third-party services it interacts with.

// 4. Whatsapp does not Allow Bots on their platform. And here we are.
//
//
//


const venom = require('venom-bot');
const { Ollama } = require('ollama-node');
const ollamaInstances = {};

function getOllamaInstance(phoneNumber) {
  if (!ollamaInstances[phoneNumber]) {
    ollamaInstances[phoneNumber] = new Ollama();
    setupModel(ollamaInstances[phoneNumber]);
  }
  return ollamaInstances[phoneNumber];
}

async function setupModel(ollamaInstance) {
  try {
    await ollamaInstance.setModel('llama3.2', {
      pretext: 'Você é um assistente útil em uma loja de peças de computador. Seu trabalho é ajudar os clientes a encontrar os componentes de computador certos para suas necessidades. Você pode ajudar com sugestões com base no tipo de computador que eles querem montar, seu orçamento e suas preferências.',
      language: 'pt-BR',  // Alterado para Português do Brasil
      prompt: 'Como posso ajudá-lo a encontrar as peças de computador perfeitas hoje?' 
    });
    console.log('Ollama model configured successfully.');
  } catch (error) {
    console.error('Error setting up Ollama model:', error);
  }
}

venom
  .create({
    session: 'session-name'
  })
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });


const processedMessages = new Set(); 

function start(client) {
  client.onAnyMessage(async (message) => {
    if (processedMessages.has(message.id)) {
      return; 
    }
    processedMessages.add(message.id);

    try {
      console.log(`Received message: ${message.body} from ${message.from}`);
      
      if (message.body.startsWith('!')) {
        const command = message.body.slice(1).trim();
        const ollamaInstance = getOllamaInstance(message.from);

        if (!ollamaInstance.isReady) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const options = {
          max_tokens: 60,
          temperature: 0.9,
          top_p: 0.9,
          presence_penalty: 0.5,
          frequency_penalty: 0.5
        };

        const response = await ollamaInstance.generate(command, options);
        const responseWithIcon = "🤖 " + response.output;

        client
          .reply(
            message.from,
            responseWithIcon,
            message.id.toString()
          )
          .then((result) => {
            console.log('Response sent successfully:', result);
          })
          .catch((error) => {
            console.error('Error sending response:', error);
          });
      } 
    } catch (error) {
      console.error('Error processing the message:', error);
    }
  });
}
