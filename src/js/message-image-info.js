class MessageImageInfo {

    /**
     * @type {number}
     */
    #imageAttachmentCount;

    /**
     * @type {number}
     */
    #emojiCount;

    /**
     * @type {number}
     */
    #entitiesRequiringIdentificationCount;

    /**
     * @type {number}
     */
    #imageIdentifierCount;

    /**
     * @param {number} imageAttachmentCount - the number of image attachments
     * @param {number} emojiCount - the number emoji characters
     * @param {number} imageIdentifierCount - the number of image identifiers
     */
    constructor(imageAttachmentCount, emojiCount, imageIdentifierCount) {
        this.#imageAttachmentCount = imageAttachmentCount;
        this.#emojiCount = emojiCount;
        this.#entitiesRequiringIdentificationCount = this.#imageAttachmentCount + this.#emojiCount;
        this.#imageIdentifierCount = imageIdentifierCount;
    }

    get idUnderIdentified() {
        return this.#imageIdentifierCount < this.#entitiesRequiringIdentificationCount;
    }

    get isCorrectlyIdentified() {
        return this.#imageIdentifierCount === this.#entitiesRequiringIdentificationCount;
    }

    get isOverIdentified() {
        return this.#imageIdentifierCount > this.#entitiesRequiringIdentificationCount;
    }

    toString() {
        return `imageAttachmentCount=${this.#imageAttachmentCount}, imageIdentifierCount=${this.#imageIdentifierCount}, emojiCount=${this.#emojiCount}`;
    }
}

export {MessageImageInfo};
