class MessageImageInfo {

    /**
     * @type {number}
     */
    #numberOfImageAttachments;

    /**
     * @type {number}
     */
    #numberOfImageIds;

    /**
     * @param {number} numberOfImageAttachments - the number of image attachments
     * @param {number} numberOfImageIds - the number of image identifiers
     */
    constructor(numberOfImageAttachments, numberOfImageIds) {
        this.#numberOfImageAttachments = numberOfImageAttachments;
        this.#numberOfImageIds = numberOfImageIds;
    }

    get idUnderIdentified() {
        return this.#numberOfImageIds < this.#numberOfImageAttachments;
    }

    get isCorrectlyIdentified() {
        return this.#numberOfImageIds === this.#numberOfImageAttachments;
    }

    get isOverIdentified() {
        return this.#numberOfImageIds > this.#numberOfImageAttachments;
    }

    toString() {
        return `message has ${this.#numberOfImageAttachments} image attachments ` +
            `and ${this.#numberOfImageIds} image identifiers`;
    }
}

export {MessageImageInfo};
