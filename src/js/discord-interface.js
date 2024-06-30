import {Events} from "discord.js";

/**
 * @typedef {typeof import('./id-bot-message.js')} IdBotMessage
 * @typedef {typeof import('discord.js')['Channel']} Channel
 * @typedef {typeof import('discord.js').Client} Client
 * @typedef {typeof import('discord.js').Events} Events
 * @typedef {typeof import('../cache.js').Cache} Cache
 */
class DiscordInterface {

    /**
     * @type Logger
     */
    _logger;

    /**
     * @type string
     */
    #clientId;

    /**
     * @type Factory
     */
    #factory;

    /**
     * @type { (client:Client) => void } - callback executed when the client has logged-in
     */
    #onClientReadyHandler;

    /**
     * @type { (message:Message) => void } - callback executed in respect of a message being created
     */
    #onMessageCreateHandler;

    /**
     * @type { (message:Message) => void } - callback executed in respect of a message being deleted
     */
    #onMessageDeleteHandler;

    /**
     * @type { (existingMessage:Message, updatedMessage:Message) => void } - callback executed in respect of a message being updated
     */
    #onMessageUpdateHandler;

    /**
     * @type Client
     */
    _client;

    /**
     * @param {Client} client
     * @param {Factory} factory
     * @param {Logger} logger
     * @param {string} clientId
     */
    constructor(client, factory, logger, clientId) {
        this._client = client;
        this.#factory = factory;
        this._logger = logger;
        this.#clientId = clientId;

        client.once(Events.ClientReady, this._onClientReady.bind(this));
        client.on(Events.MessageCreate, this._onMessageCreate.bind(this));
        client.on(Events.MessageUpdate, this._onMessageUpdate.bind(this));
        client.on(Events.MessageDelete, this._onMessageDelete.bind(this));
    }

    _createIdBotMessage = discordJsMessage => this.#factory.createIdBotMessage(discordJsMessage);

    _onClientReady(client) {
        this._logger.log(`Logged in as "${client.user.tag}" and ready.`);
        this?.#onClientReadyHandler(client);
    }

    async _onMessageCreate(message) {
        this?.#onMessageCreateHandler(this._createIdBotMessage(message));
    }

    async _onMessageUpdate(originalMessage, updatedMessage) {
        this?.#onMessageUpdateHandler(
            this._createIdBotMessage(originalMessage),
            this._createIdBotMessage(updatedMessage),
        );
    }

    async _onMessageDelete(message) {
        this?.#onMessageDeleteHandler(this._createIdBotMessage(message));
    }

    /**
     * @param {IdBotMessage} message
     * @returns {boolean}
     */
    isOurReply = message => message.isReplyBy(this.#clientId);

    /**
     * @param {IdBotMessage} received
     * @param {string} content
     * @return Promise<Message>
     */
    async replyTo(received, content) {
        this._logger.debug(`sending reply to ${received.id} with "${content}"`);

        return received.discordJsMessage.reply(content);
    }

    /**
     * @param {Channel} channel
     * @param messageId
     */
    deleteMessage(channel, messageId) {
        this._logger.debug(`attempting to delete replies to message with id=${messageId}`);

        return channel
            .messages
            .delete(messageId)
            .then(() => this._logger.debug(`deleted reply with id=${messageId}`))
            .catch(e => this._logger.error(`could not delete reply with id=${messageId}`, e));
    }

    /**
     * @param {string} token
     */
    login(token) {
        this._client.login(token).catch(e => this._logger.error("Unable to log-in", e));
    }

    close() {
        this._logger.info("Closing connection...");
        
        return this._client.close;
    }

    setClientReadyHandler(onClientReadyHandler) {
        this.#onClientReadyHandler = onClientReadyHandler;

        return this;
    }

    setMessageCreateHandler(messageCreateHandler) {
        this.#onMessageCreateHandler = messageCreateHandler;

        return this;
    }

    setMessageUpdateHandler(messageCreateHandler) {
        this.#onMessageUpdateHandler = messageCreateHandler;

        return this;
    }

    setMessageDeleteHandler(messageDeleteHandler) {
        this.#onMessageDeleteHandler = messageDeleteHandler;

        return this;
    }
}

export {
    DiscordInterface
};
