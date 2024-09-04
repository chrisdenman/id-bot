import {IdBotMessage} from "./id-bot-message.js";
import {Cache} from "./cache.js";
import {CacheMeta} from "./cache-meta.js";
import {IdBot} from "./id-bot.js";
import {ImageIdStats} from "./image-id-stats.js";
import {LEVEL_DEBUG, LEVEL_LOG, LEVEL_ERROR, LEVEL_FATAL, LEVEL_WARN, Logger} from "./logger.js";
import {Client, IntentsBitField} from "discord.js";
import {DiscordInterface} from "./discord-interface.js";
import {Application} from "./application.js";
import {CacheMaxStaleManager} from "./cache-max-stale-manager.js";
import {numberOfEmojiContained} from "./emoji.js";
import {isImageMediaType} from "./media-type.js";

const intents = new IntentsBitField();
intents.add(IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent);
const CLIENT_OPTIONS = Object.freeze({intents});

class Factory {

    #logLevel;

    /**
     * @type RegExp
     */
    #MESSAGE_ID_REGEXP = /(?<=(^|\s|\W)ID:\s*)(\w+)(?!\WID:)/svg;

    /**
     * @type RegExp
     */
    #CUSTOM_EMOJI_REGEX = /<(a)?:(?<name>\w+):(?<id>\d+)>/g;

    static get #CLIENT_OPTIONS() {
        return CLIENT_OPTIONS;
    };

    constructor(logLevel = LEVEL_DEBUG | LEVEL_LOG | LEVEL_WARN | LEVEL_ERROR | LEVEL_FATAL) {
        this.#logLevel = logLevel;
    }

    /**
     * @param {Cache} cache
     * @param {number} tickIntervalDurationMilliSeconds
     * @param {number} maxStaleLifetimeMilliSeconds
     * @returns {CacheMaxStaleManager}
     */
    createCacheExpirator(cache, tickIntervalDurationMilliSeconds = 100, maxStaleLifetimeMilliSeconds = undefined) {
        return new CacheMaxStaleManager(
            cache,
            this.createLogger("MaxStaleCacheManager"),
            this,
            tickIntervalDurationMilliSeconds,
            maxStaleLifetimeMilliSeconds
        );
    };

    /**
     *
     * @param {string} clientId
     * @param {number} tickIntervalDurationMilliSeconds
     * @param {number} maxStaleCacheLifetimeMilliSeconds
     *
     * @returns {Application}
     */
    createApplication = (clientId, tickIntervalDurationMilliSeconds, maxStaleCacheLifetimeMilliSeconds) =>
        new Application(
            process,
            this.createIdBot(clientId, tickIntervalDurationMilliSeconds, maxStaleCacheLifetimeMilliSeconds)
        );

    /**
     *
     * @returns {Cache}
     */
    createCache() {
        return new Cache(this, this.createLogger("MessageIdToReplyIdCache"));
    };

    /**
     * @param {string} clientId
     *
     * @returns {DiscordInterface}
     */
    #createDiscordInterface = clientId =>
        new DiscordInterface(
            new Client(Factory.#CLIENT_OPTIONS),
            this,
            this.createLogger(`DiscordInterface(clientId=${clientId})`),
            clientId
        );

    /**
     * @param {string} clientId
     * @param tickIntervalDurationMilliSeconds
     * @param {number} maxStaleLifetimeMilliSeconds
     *
     * @returns {IdBot}
     */
    createIdBot = (clientId, tickIntervalDurationMilliSeconds, maxStaleLifetimeMilliSeconds) => {
        const cache = this.createCache();

        return new IdBot(
            cache,
            this.createCacheExpirator(cache, tickIntervalDurationMilliSeconds, maxStaleLifetimeMilliSeconds),
            this.#createDiscordInterface(clientId),
            this.createLogger(`IdBot(${clientId})`)
        );
    };

    /**
     *
     * @returns {number}
     */
    get getNowInMilliSeconds() {
        return Date.now();
    };

    /**
     *
     * @param discordJsMessage
     * @returns {IdBotMessage}
     */
    createIdBotMessage = discordJsMessage => {
        const content = discordJsMessage.content;

        const contentCustomEmojiMatches = [...content.matchAll(this.#CUSTOM_EMOJI_REGEX)];

        const contentStrippedOfCustomEmoji = content.replaceAll(this.#CUSTOM_EMOJI_REGEX, "");
        const numberOfEmoji = numberOfEmojiContained(contentStrippedOfCustomEmoji);

        const idMatches = [...content.matchAll(this.#MESSAGE_ID_REGEXP)];

        const imageIdStats = this.createImageIdStats(
            [...discordJsMessage.attachments.values()]
                .map(v => v.contentType)
                .filter(isImageMediaType)
                .length,
            numberOfEmoji,
            contentCustomEmojiMatches.length,
            idMatches.length
        );

        return new IdBotMessage(imageIdStats, discordJsMessage);
    };

    /**
     * @param {string} [prefix]
     * @returns {Logger}
     */
    createLogger = (prefix = undefined) => new Logger(console, this.#logLevel, prefix);

    /**
     * @param {*} key
     *
     * @returns {CacheMeta}
     */
    createCacheMeta = key => {
        const now = this.getNowInMilliSeconds;

        return new CacheMeta(key, now, now);
    };

    withCacheAccess = cacheMeta => new CacheMeta(
        cacheMeta.key,
        cacheMeta.createdAt,
        this.getNowInMilliSeconds,
        cacheMeta.lastUpdatedAt
    );

    withUpdate = cacheMeta => new CacheMeta(
        cacheMeta.key,
        cacheMeta.createdAt,
        cacheMeta.lastAccessedAt,
        this.getNowInMilliSeconds
    );

    /**
     * @param {number} imageAttachmentCount
     * @param {number} emojiCount
     * @param {number} customEmojiCount
     * @param {number} imageIdentifierCount
     *
     * @returns {ImageIdStats}
     */
    createImageIdStats = (
        imageAttachmentCount,
        emojiCount,
        customEmojiCount,
        imageIdentifierCount
    ) =>
        new ImageIdStats(imageAttachmentCount, emojiCount, customEmojiCount, imageIdentifierCount);
}

export {Factory};
