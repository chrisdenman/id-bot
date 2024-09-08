import {expect, describe, it} from "vitest";
import {createUuid} from "./uuid";

import {Factory} from "../js/factory";
import {LEVEL_OFF} from "../js/logger.js";

const factory = new Factory(
    LEVEL_OFF,
    /(?<=(^|\s|\W)ID:\s*)(\w+)(?!\WID:)/svg,
    /<(a)?:(?<name>\w+):(?<id>\d+)>/g
);

describe(
    "Emoji, custom-emoji and image-identifier counting..",
    () => [
        ["", 0, 0, 0],
        [" ID:", 0, 0, 0],
        // ["\u{0023}ID: a", 0, 0, 0],
        ["\u{0030}ID: a", 0, 0, 0],
        ["\u{0039}id: ", 0, 0, 0],
        ["\u{00AE}iD: a", 0, 0, 0],
        ["ID: a🫸", 1, 0, 1],
        ["ID: 🫸 ID: 🫸", 2, 0, 0],
        ["ID: a🫸 ID: a🫸", 2, 0, 2],
        [" 🫸🫸ID: ", 2, 0, 0],
        ["🫸ID: x🫸 ", 2, 0, 1],
        [" 🫸ID: 🫸ID:  ", 2, 0, 0],
        ["<:blah:345802398509358903485093> ID: a🫸", 1, 1, 1],
        ["<:name:1245079798410121307>ID: ", 0, 1, 0],
        ["ID: something <a:name:1245079798410121307>", 0, 1, 1],
        ["ID:    s    <:n:1245079798410121307> ID:     d", 0, 1, 2],
        ["<a:n:1245079798410121307>WID: ", 0, 1, 0],
        ["<:name:1>", 0, 1, 0],
        ["<a:name:1>", 0, 1, 0],
        ["<:n:1>", 0, 1, 0],
        ["<a:n:1>", 0, 1, 0],
        ["<a:-:a>", 0, 0, 0],
        ["<a:n:a>", 0, 0, 0],
        ["<b:n:1>", 0, 0, 0],
        ["<ab:n:1>", 0, 0, 0],
        ["<ba:n:1>", 0, 0, 0],
        ["<::1245079798410121307>", 0, 0, 0],
        ["<a::1245079798410121307>ID: abcsID: abcd.", 0, 0, 1],
        ["<::1>", 0, 0, 0],
        ["<a::1>", 0, 0, 0],
        ["<:name:>", 0, 0, 0],
        ["<a:name:>", 0, 0, 0],
        ["<:n:>", 0, 0, 0],
        ["<a:n:>", 0, 0, 0],
        [":name:1245079798410121307>", 0, 0, 0],
        ["a:name:1245079798410121307>", 0, 0, 0],
        [":n:1245079798410121307>", 0, 0, 0],
        ["a:n:1245079798410121307>", 0, 0, 0],
        [":name:1>", 0, 0, 0],
        ["a:name:1>", 0, 0, 0],
        [":n:1>", 0, 0, 0],
        ["a:n:1>", 0, 0, 0],
        ["<:name:1245079798410121307", 0, 0, 0],
        ["<a:name:1245079798410121307", 0, 0, 0],
        ["<:n:1245079798410121307", 0, 0, 0],
        ["<a:n:1245079798410121307", 0, 0, 0],
        ["<:name:1", 0, 0, 0],
        ["<a:name:1", 0, 0, 0],
        ["<:n:1", 0, 0, 0],
        ["<a:n:1", 0, 0, 0],
        [":name:1245079798410121307", 0, 0, 0],
        ["a:name:1245079798410121307", 0, 0, 0],
        [":n:1245079798410121307", 0, 0, 0],
        ["a:n:1245079798410121307", 0, 0, 0],
        [":name:1", 0, 0, 0],
        ["a:name:1 ID: abcs.ID: abcd.", 0, 0, 2],
        [":n:1", 0, 0, 0],
        ["a:n:1", 0, 0, 0],
        ["🫸<:id:3458>", 1, 1, 0],
        ["🫸<:custom_emoji:3458>🫸", 2, 1, 0],
        ["<:custom:3454458>🫸<:fish:3453453453458>🫸<:something:3458>", 2, 3, 0],
        [`<:custom:3454458> ID: a custom emoji ID: whoopee
🐈ID: an emoji of a cat. ID: an emoji of a castle 

🏰`, 2, 1, 4],
    ].forEach(([content, expectedEmojiCount, expectedCustomEmojiCount, expectedImageIdCount]) =>
        it(
            `That "${content}" contains ${expectedEmojiCount} emoji characters and ${expectedCustomEmojiCount} custom emoji references and ${expectedImageIdCount} image ids.`,
            () => {
                const imageIdStats = factory
                    .createIdBotMessage({
                        id: createUuid(),
                        attachments: new Map(),
                        content
                    }).imageIdStats;
                expect(imageIdStats.emojiCount).toBe(expectedEmojiCount);
                expect(imageIdStats.customEmojiCount).toBe(expectedCustomEmojiCount);
                expect(imageIdStats.imageIdentifierCount).toBe(expectedImageIdCount);
            }
        )
    )
);
