import {DiscordInterface} from "../js/discord-interface";

class DiscordInterfaceHarness extends DiscordInterface {

    /**
     * @type {Map}
     */
    #messageIdToMessage;

    constructor(client, factory, logger, clientId) {
        super(client, factory, logger, clientId);
        this.#messageIdToMessage = new Map();
    }

    onClientReady() {
        super._onClientReady(this._client);
    }

    onMessageCreate(message) {
        this.#messageIdToMessage.set(message.id, message);

        return super._onMessageCreate(message);
    }

    onMessageUpdate(originalMessage, updatedMessage) {
        return super._onMessageUpdate(originalMessage, updatedMessage);
    }

    onMessageDelete(message) {
        return super._onMessageDelete(message);
    }
}

export {
    DiscordInterfaceHarness
};
