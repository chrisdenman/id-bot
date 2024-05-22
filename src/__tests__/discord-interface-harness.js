import {assert} from "vitest";
import {DiscordInterface} from "../js/discord-interface";

class DiscordInterfaceHarness extends DiscordInterface {

    /**
     * @type {String}
     */
    #channelId;

    /**
     * @type {Map}
     */
    #messageIdToMessage;

    constructor(client, factory, logger, clientId, channelId) {
        super(client, factory, logger, clientId);
        this.#channelId = channelId;
        this.#messageIdToMessage = new Map();
    }

    fetchMessage(channel, messageId, f) {
        assert(this.#channelId === channel.id);
        const message = this.#messageIdToMessage.get(messageId);
        f(this._createIdBotMessage(message));
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
