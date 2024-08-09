import { BotDeclaration } from "express-msteams-host";
import * as debug from "debug";
import { CardFactory, ConversationState, MemoryStorage, UserState, TurnContext, MessageFactory, StatePropertyAccessor, ActionTypes, ActivityTypes } from "botbuilder";
import { DialogBot } from "./dialogBot";
import { MainDialog } from "./dialogs/mainDialog";
import WelcomeCard from "./cards/welcomeCard";
import * as Util from 'util';
import { Dialog, DialogSet, DialogState } from "botbuilder-dialogs";
import { HelpDialog } from "./dialogs/helpDialog";
// const TextEncoder = Util.TextDecoder;

// Initialize debug logging module
const log = debug("msteams");

/**
 * Implementation for Jerome Bot
 */
  @BotDeclaration(
      "/api/messages",
      new MemoryStorage(),
      // eslint-disable-next-line no-undef
      "eb615f6f-535c-407c-9301-fc37cf4838b6",
      // eslint-disable-next-line no-undef
      "ji08Q~pW0~qCoxD470efK1Liujv~dmoyiC~SibSY")

export class JeromeBot extends DialogBot {

    public readonly conversationState: ConversationState;
    public readonly dialogs: DialogSet;
    public dialogState: StatePropertyAccessor<DialogState>;

    constructor(conversationState: ConversationState, userState: UserState) {
        super(conversationState, userState, new MainDialog());

        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new HelpDialog());
        this.onMessage(async (context: TurnContext): Promise<void> => {
            switch (context.activity.type) {
                case ActivityTypes.Message:
                    {
                        let text = TurnContext.removeRecipientMention(context.activity);
                        text = text.toLowerCase();
                        if (text.startsWith("mentionme")) {
                            await this.handleMessageMentionMeOneToOne(context);
                        } else if (text.startsWith("hello")) {
                            await context.sendActivity("Oh hello there buddy!");
                        } else {
                            context.sendActivity("Sorry, my trainer hasn't trained me for this");
                        }
                    }
                    break;
                default:
                    break;
            }
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            if (membersAdded && membersAdded.length > 0) {
                for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                    if (membersAdded[cnt].id !== context.activity.recipient.id) {
                        await this.sendWelcomeCard( context );
                    }
                }
            }
            await next();
        });
    }

    public async sendWelcomeCard( context: TurnContext ): Promise<void> {
        const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
        await context.sendActivity({ attachments: [welcomeCard] });
    }

    private async handleMessageMentionMeOneToOne(context: TurnContext): Promise<void> {

        const mention = {
            mentioned: context.activity.from,
            text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
            type: "mention"
        };

        const replyActivity = MessageFactory.text(`Hi ${mention.text} from a 1:1 chat`);
        replyActivity.entities = [mention];
        await context.sendActivity(replyActivity);

    }

}
