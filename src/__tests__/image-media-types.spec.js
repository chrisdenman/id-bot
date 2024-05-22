import { expect, describe, it } from "vitest";

import {IMAGE_MEDIA_TYPES} from "../js/image-media-types.js";

describe(
    "Sanity testing that all Discord supported images are detected as images",
    () => [
        ["image/png"],
        ["image/jpeg"],
        ["image/gif"],
    ].forEach(([mediaType]) =>
        it(
            `That ${mediaType} is determined to be an image media type`,
            () => expect(IMAGE_MEDIA_TYPES.includes(mediaType)).toBe(true)
        )
    )
);
