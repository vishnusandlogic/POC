const { default: axios } = require('axios');
const { ActivityHandler, MessageFactory } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            let replyText = '';
            const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json').then(async (result) => {
                console.log(`Result is ${result.data}`)
                if(result && result.data) {
                    replyText = JSON.stringify(result.data);
                    await context.sendActivity(MessageFactory.text(replyText, replyText));
                }
            }).catch((err) => {
                console.log(`Error is ${err}`);
            });
            
            
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
