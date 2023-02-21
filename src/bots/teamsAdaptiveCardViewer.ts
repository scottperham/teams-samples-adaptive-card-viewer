import { TeamsActivityHandler, TurnContext, MessageFactory, CardFactory, SigninStateVerificationQuery, AdaptiveCardInvokeResponse, AdaptiveCardInvokeValue } from "botbuilder";
import * as act from 'adaptivecards-templating';

export class AdaptiveCardViewerBot extends TeamsActivityHandler {

    constructor() {
        super();
        
        this.onMessage(async (context, next) : Promise<void> => {
            
            await this.sendInputCard(context);

            await next();
        });
    }

    async sendInputCard(context: TurnContext) : Promise<void>{
        await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard({
            "type": "AdaptiveCard",
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.4",
            "body": [
                {
                    "type": "Input.Text",
                    "placeholder": "Paste your adaptive card JSON here...",
                    "id": "json",
                    "isMultiline": true,
                    "label": "Adaptive Card JSON"
                },
                {
                    "type": "Input.Text",
                    "placeholder": "Paste your transform data here...",
                    "isMultiline": true,
                    "label": "Transform data",
                    "id": "transform"
                },
                {
                    "type": "ActionSet",
                    "actions": [
                        {
                            "type": "Action.Execute",
                            "title": "Submit"
                        }
                    ]
                }
            ]
        })));
    }

    // This is the entry point for the bot processing pipeline
    // Generally we want the base class to handle the initial processing
    // but this is a great place to save any state changes we've set
    // during the turn
    async run(context: TurnContext): Promise<void> {
        await super.run(context);
    }

    protected async onAdaptiveCardInvoke(context: TurnContext, invokeValue: AdaptiveCardInvokeValue): Promise<AdaptiveCardInvokeResponse> {

        await this.sendInputCard(context);

        const template = new act.Template(JSON.parse((invokeValue.action.data as any).json));
        const data = JSON.parse((invokeValue.action.data as any)?.transform ?? "{}");
        return {
            statusCode: 200,
            type: CardFactory.contentTypes.adaptiveCard,
            value: template.expand({$root:{...data}})
        };
    }
}