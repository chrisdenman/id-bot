import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Application} from "../js/application";
import {IdBot} from "../js/id-bot.js";
import {Factory} from "../js/factory";
import {LEVEL_OFF, Logger} from "../js/logger";
import {DiscordInterfaceHarness} from "./discord-interface-harness";
import {createUuid} from "./uuid";
import {MessageType} from "discord-api-types/v10";

vi.mock("discord.js", async (importOriginal) => {
    return {
        ...(await importOriginal())
    };
});

const [TOKEN, CLIENT_ID] = ["token", createUuid()];
const UNDER_DESCRIBED_REMINDER_MESSAGE = "Hello! Please add an ID for each image. Thank you! ❤️";
const OVER_DESCRIBED_REMINDER_MESSAGE = "Hello! Whoops, did you forget an image? ❤️";
const AUTHOR_ID__NOT_US = createUuid();
const CONTENT_EMPTY = "";
const RESOLVES_TO = arg => new Promise(resolve => resolve(arg));

const createDiscordJsMessage = function (
    content = CONTENT_EMPTY,
    attachmentContentTypes = [],
    authorId = AUTHOR_ID__NOT_US,
    type = MessageType.Default,
    referenceMessageId = undefined,
    isBotAuthored = false,
    id = createUuid(),
) {
    const attachments = new Map(attachmentContentTypes.map(v => [createUuid(), {contentType: v}]));

    return {
        id: id,
        author: {
            id: authorId,
            bot: isBotAuthored
        },
        content: content,
        attachments: attachments,
        type: type,
        reference: {
            messageId: referenceMessageId
        },
        channel: {
            messages: {
                delete: vi.fn().mockImplementationOnce(RESOLVES_TO),
                fetch: vi.fn().mockImplementationOnce(RESOLVES_TO)
            }
        },
        reply: vi.fn()
    };
};

/**
 * @param {IdBotMessage} userMessage
 * @param {IdBotMessage} replyContent
 */
const createIdBotReply = function (userMessage, replyContent) {
    return createDiscordJsMessage(
        replyContent,
        [],
        CLIENT_ID,
        MessageType.Reply,
        userMessage.id,
        true
    );
};

describe("Application startup and shutdown", () => {
    let factory, process, client, discordInterfaceHarness, cache, unboundCacheExpirator, idBot, application;

    const withExpirator = (altCacheExpiratorProvider = undefined) => {
        cache = factory.createCache();
        unboundCacheExpirator = (altCacheExpiratorProvider && altCacheExpiratorProvider(cache)) ||
            factory.createCacheExpirator(cache);
        idBot = new IdBot(
            cache,
            unboundCacheExpirator,
            discordInterfaceHarness,
            new Logger(console, `IdBot(${CLIENT_ID})`)
        );
        application = new Application(process, idBot);
    };

    beforeEach(() => {
        factory = new Factory(
            /(?<=(^|\s|\W)ID:\s*)(\w+)(?!\WID:)/svg,
            /<(a)?:(?<name>\w+):(?<id>\d+)>/g,
            LEVEL_OFF
        );
        process = {on: vi.fn(), exit: vi.fn()};
        client = {
            once: vi.fn(),
            on: vi.fn(),
            login: vi.fn().mockImplementationOnce(RESOLVES_TO),
            close: vi.fn(),
            user: {
                tag: "tag"
            }
        };
        discordInterfaceHarness = new DiscordInterfaceHarness(
            client,
            factory,
            factory.createLogger(`DiscordInterface(${CLIENT_ID})`),
            CLIENT_ID);

        withExpirator();
    });

    afterEach(() => {
        application.stop();
        vi.restoreAllMocks();
    });

    it("That login errors as swallowed.", () => {
        application.start(TOKEN);
        client.login = vi.fn().mockImplementationOnce(() => {
            console.log("WOT");
            new Promise((_, error) => {
                error("login failed");
                throw new Error("logg-in failed");
            });
        });
    });

    it("That messages authored by other bots are ignored even if they contain attachments that could be prompted in respect of.", () => {
        application.start(TOKEN);
        discordInterfaceHarness.onClientReady();

        const discordJsMessage = createDiscordJsMessage(CONTENT_EMPTY, ["image/png"], AUTHOR_ID__NOT_US, MessageType.Default, undefined, true);
        discordInterfaceHarness.onMessageCreate(discordJsMessage);
        application.stop();

        expect(discordJsMessage.reply).not.toBeCalled();
    });

    it("That updates for messages we are not tracking are handled.", () => {
        application.start(TOKEN);
        discordInterfaceHarness.onClientReady();

        const updatedMessage = createDiscordJsMessage(CONTENT_EMPTY, ["image/png"], AUTHOR_ID__NOT_US, MessageType.Default, createUuid(), false);
        discordInterfaceHarness.onMessageUpdate(updatedMessage, updatedMessage);
        expect(updatedMessage.reply).toBeCalledWith(UNDER_DESCRIBED_REMINDER_MESSAGE);

        application.stop();
    });

    it(
        "That messages with attachments that are non image media types are ignored.",
        () => {
            const [content, attachmentData] = ["A message with no image identifiers", ["text/html"]];
            const userMessage = createDiscordJsMessage(content, attachmentData);
            discordInterfaceHarness.onMessageCreate(userMessage);
            expect(userMessage.reply).not.toBeCalled();
        }
    );

    describe(
        "Ensuring that new messages are given the correct reminder replies",
        () => [
            [CONTENT_EMPTY, ["image/png"], UNDER_DESCRIBED_REMINDER_MESSAGE, "ID: An image of something."],
            ["ID: A big shiny horse.", [], OVER_DESCRIBED_REMINDER_MESSAGE, CONTENT_EMPTY],
            ["ID: A big shiny horse.", [], OVER_DESCRIBED_REMINDER_MESSAGE, undefined],
            ["ID: blah", ["image/png", "image/png"], UNDER_DESCRIBED_REMINDER_MESSAGE, "ID blah.ID: foo"],
            ["ID: A big shiny horse. ID: A mushroom!", ["image/png"], OVER_DESCRIBED_REMINDER_MESSAGE, "ID: A mushroom!"],
            ["ID: A big shiny horse. ID: A mushroom!", ["image/png"], OVER_DESCRIBED_REMINDER_MESSAGE, undefined],
            ["No image tags here.", [], undefined, undefined],
        ].forEach(([
                       content,
                       attachmentData,
                       expectedReplyContent,
                       updatedContent
                   ]) => {
                it(
                    `Message="${content}", attachments=${attachmentData}, expectedReply="${expectedReplyContent}", updatedContent="${updatedContent}"`,
                    () => {
                        application.start(TOKEN);
                        discordInterfaceHarness.onClientReady();

                        // User posts a message
                        const userMessage = createDiscordJsMessage(content, attachmentData);
                        discordInterfaceHarness.onMessageCreate(userMessage);

                        // IdBot replies iff the user's message is not properly tagged
                        let idBotReplyMessage;
                        if (expectedReplyContent !== undefined) {
                            expect(userMessage.reply).toBeCalledWith(expectedReplyContent);

                            // IdBot reply received by discord.js, idBot caches referenced message to idBot reply if the message is not correctly identified
                            idBotReplyMessage = createIdBotReply(userMessage, expectedReplyContent);
                            discordInterfaceHarness.onMessageCreate(idBotReplyMessage);
                        }

                        // User deletes their message
                        if (updatedContent === undefined) {
                            discordInterfaceHarness.onMessageDelete(userMessage);

                            // IdBot deletes its reply if it produced one
                            if (idBotReplyMessage !== undefined) {
                                expect(userMessage.channel.messages.delete).toBeCalledWith(idBotReplyMessage.id);
                            }
                        } else { // User corrects the issue
                            // User edits their post to correct it
                            const updatedUserMessage = createDiscordJsMessage(
                                updatedContent,
                                attachmentData,
                                AUTHOR_ID__NOT_US,
                                MessageType.Default,
                                undefined,
                                false,
                                userMessage.id
                            );
                            discordInterfaceHarness.onMessageUpdate(userMessage, updatedUserMessage);

                            // IdBot deletes its reply
                            expect(updatedUserMessage.channel.messages.delete).toBeCalledWith(idBotReplyMessage.id);
                        }
                    });
            }
        )
    );

    describe(
        "That quickly culling cache entries means ",
        () => {
            it(
                `Something`,
                async () => {
                    vi.useRealTimers();

                    withExpirator(c => factory.createCacheExpirator(c, 10, 1));

                    application.start(TOKEN);
                    discordInterfaceHarness.onClientReady();

                    const userMessage = createDiscordJsMessage("ID: Something", []);
                    discordInterfaceHarness.onMessageCreate(userMessage);

                    // Discord.js creation event for our previous reply, idBot caches referenced message to idBot reply if the message is not correctly identified
                    discordInterfaceHarness.onMessageCreate(createIdBotReply(userMessage, OVER_DESCRIBED_REMINDER_MESSAGE));
                    const updatedUserMessage = createDiscordJsMessage(
                        "Blah blah blah.",
                        [],
                        AUTHOR_ID__NOT_US,
                        MessageType.Default,
                        undefined,
                        false,
                        userMessage.id
                    );
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    discordInterfaceHarness.onMessageUpdate(userMessage, updatedUserMessage);
                    expect(updatedUserMessage.channel.messages.delete).not.toHaveBeenCalled();

                    application.stop();
                }
            );
        }
    );

    it("That normal shutdown closes the IdBot instance and returns the correct process exit code", () => {
        application.start(TOKEN);
        application.stop();

        expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("That termination closes the IdBot instance and returns the correct process exit code", () => {
        application.start(TOKEN);
        application.terminate();

        expect(process.exit).toHaveBeenCalledWith(-1);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });
});
