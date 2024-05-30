class ImageIdStats {

    /**
     * @type number
     */
    #imageAttachmentCount;

    /**
     * @type number
     */
    #emojiCount;

    /**
     * @type number
     */
    #customEmojiCount;

    /**
     * @type number
     */
    #entitiesRequiringIdentificationCount;

    /**
     * @type number
     */
    #imageIdentifierCount;

    /**
     * @param {number} imageAttachmentCount - the number of image attachments
     * @param {number} emojiCount - the number of emoji characters
     * @param {number} customEmojiCount - the number custom-emoji 'characters'
     * @param {number} imageIdentifierCount - the number of image identifiers
     */
    constructor(imageAttachmentCount, emojiCount, customEmojiCount, imageIdentifierCount) {
        this.#imageAttachmentCount = imageAttachmentCount;
        this.#emojiCount = emojiCount;
        this.#customEmojiCount = customEmojiCount;
        this.#entitiesRequiringIdentificationCount = imageAttachmentCount + emojiCount + customEmojiCount;

        this.#imageIdentifierCount = imageIdentifierCount;
    }

    /**
     * Returns true if `imageIdentifierCount < entitiesRequiringIdentificationCount`
     *
     * @returns {boolean} `true` iff. the message is under-identified
     */
    get isUnderIdentified() {
        return this.#imageIdentifierCount < this.#entitiesRequiringIdentificationCount;
    }

    /**
     * Returns true iff. `imageIdentifierCount == entitiesRequiringIdentificationCount`
     *
     * @returns {boolean} `true` iff. the message is correctly identified
     */
    get isCorrectlyIdentified() {
        return this.#imageIdentifierCount === this.#entitiesRequiringIdentificationCount;
    }

    /**
     * Returns true iff. `imageIdentifierCount > entitiesRequiringIdentificationCount`
     *
     * @returns {boolean} `true` iff. the message is over-identified
     */
    get isOverIdentified() {
        return this.#imageIdentifierCount > this.#entitiesRequiringIdentificationCount;
    }

    /**
     * The number of Unicode emoji defined.
     *
     * @returns {number}
     */
    get emojiCount() {
        return this.#emojiCount;
    }

    /**
     * The number of custom (Discord) emoji defined.
     *
     * @returns {number}
     */
    get customEmojiCount() {
        return this.#customEmojiCount;
    }

    /**
     * The number of image attachments defined.
     *
     * @returns {number}
     */
    get imageIdentifierCount() {
        return this.#imageIdentifierCount;
    }

    /**
     * @returns {string}
     */
    toString() {
        const description = this.isCorrectlyIdentified ? "Pass" : this.isUnderIdentified ? "FU" : "FO";
        const stats = `{attached: ${this.#imageAttachmentCount}, emoji: ${this.#emojiCount}, customEmoji: ${this.#customEmojiCount}, ids: ${this.#imageIdentifierCount}}`;

        return `{state: ${description}, counts: ${stats}}`;
    }
}

export {ImageIdStats};
