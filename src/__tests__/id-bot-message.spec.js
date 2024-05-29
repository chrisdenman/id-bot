import {expect, describe, it} from "vitest";
import {createUuid} from "./uuid";

import {Factory} from "../js/factory";

const factory = new Factory();

describe(
    "Emoji character counting in message content",
    () => [
        ["", 0, 0],
        [" ", 0, 0],
        ["\u{0023}", 0, 0],
        ["\u{0030}", 0, 0],
        ["\u{0039}", 0, 0],
        ["\u{00AE}", 0, 0],
        ["🫸", 1, 0],
        ["🫸🫸", 2, 0],
        [" 🫸🫸", 2, 0],
        ["🫸🫸 ", 2, 0],
        [" 🫸🫸 ", 2, 0],
        ["<:blah:345802398509358903485093>🫸", 1, 1],
        ["<:name:1245079798410121307>", 0, 1],
        ["<a:name:1245079798410121307>", 0, 1],
        ["<:n:1245079798410121307>", 0, 1],
        ["<a:n:1245079798410121307>", 0, 1],
        ["<:name:1>", 0, 1],
        ["<a:name:1>", 0, 1],
        ["<:n:1>", 0, 1],
        ["<a:n:1>", 0, 1],
        ["<a:-:a>", 0, 0],
        ["<a:n:a>", 0, 0],
        ["<b:n:1>", 0, 0],
        ["<ab:n:1>", 0, 0],
        ["<ba:n:1>", 0, 0],
        ["<::1245079798410121307>", 0, 0],
        ["<a::1245079798410121307>", 0, 0],
        ["<::1>", 0, 0],
        ["<a::1>", 0, 0],
        ["<:name:>", 0, 0],
        ["<a:name:>", 0, 0],
        ["<:n:>", 0, 0],
        ["<a:n:>", 0, 0],
        [":name:1245079798410121307>", 0, 0],
        ["a:name:1245079798410121307>", 0, 0],
        [":n:1245079798410121307>", 0, 0],
        ["a:n:1245079798410121307>", 0, 0],
        [":name:1>", 0, 0],
        ["a:name:1>", 0, 0],
        [":n:1>", 0, 0],
        ["a:n:1>", 0, 0],
        ["<:name:1245079798410121307", 0, 0],
        ["<a:name:1245079798410121307", 0, 0],
        ["<:n:1245079798410121307", 0, 0],
        ["<a:n:1245079798410121307", 0, 0],
        ["<:name:1", 0, 0],
        ["<a:name:1", 0, 0],
        ["<:n:1", 0, 0],
        ["<a:n:1", 0, 0],
        [":name:1245079798410121307", 0, 0],
        ["a:name:1245079798410121307", 0, 0],
        [":n:1245079798410121307", 0, 0],
        ["a:n:1245079798410121307", 0, 0],
        [":name:1", 0, 0],
        ["a:name:1", 0, 0],
        [":n:1", 0, 0],
        ["a:n:1", 0, 0],
        ["🫸<:id:3458>", 1, 1],
        ["🫸<:custom_emoji:3458>🫸", 2, 1],
        ["<:custom:3454458>🫸<:fish:3453453453458>🫸<:something:3458>", 2, 3],
    ].forEach(([messageContent, expectedEmojiCount, expectedCustomEmojiCount]) =>
        it(
            `That "${messageContent}" contains ${expectedEmojiCount} emoji characters and ${expectedCustomEmojiCount} custom emoji references.`,
            () => {
                const imageIdStats = factory
                    .createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content: messageContent
                    }).imageIdStats;
                expect(imageIdStats.emojiCount).toBe(expectedEmojiCount);
                expect(imageIdStats.customEmojiCount).toBe(expectedCustomEmojiCount);
            }
        )
    )
);


describe(
    "Image ID counting in message content",
    () => [
        ["", 0],
        ["         ", 0],
        ["ID:", 0],
        ["ID: a", 1],
        ["ID: ab", 1],
        ["ID: abc", 1],
        ["ID: abcd", 1],
        ["ID: abcd. ID: abcd.", 2],
        ["ID: abcd. ID: a", 2],
        ["ID: aID: abcd.", 1],
        ["ID: abcsID: abcd.", 1],
        ["ID: abcs. ID: abcd.", 2],
        ["ID: abcs ID: abcd.     ID: abcd", 3]
    ].forEach(([messageContent, expectedImageIdCount]) =>
        it(
            `That "${messageContent}" contains ${expectedImageIdCount} identifiers`,
            () => {
                const discordMessage = factory
                    .createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content: messageContent
                    });

                expect(discordMessage.imageIdStats.imageIdentifierCount).toBe(expectedImageIdCount);
            }
        )
    )
);
