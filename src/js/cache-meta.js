class CacheMeta {

    /**
     * @type number
     */
    #createdAt;

    /**
     * @type number
     */
    #lastAccessedAt;

    /**
     * @type number
     */
    #updatedAt;

    /**
     * @type Any
     */
    #key;

    /**
     * @type Any
     */
    #value;

    /**
     * @param  {*} key
     * @param  {*} value
     * @param  {number} createdAt
     * @param  {number} lastAccessedAt
     * @param  {number} updatedAt
     */
    constructor(key, value, createdAt, lastAccessedAt = undefined, updatedAt = undefined) {
        this.#key = key;
        this.#value = value;
        this.#createdAt = createdAt;
        this.#lastAccessedAt = lastAccessedAt;
        this.#updatedAt = updatedAt;
    }

    /**
     * @returns {*}
     */
    get key() {
        return this.#key;
    }

    /**
     * @returns {*}
     */
    get value() {
        return this.#value;
    }

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was created
     */
    get createdAt() {
        return this.#createdAt;
    }

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was last read
     */
    get lastAccessedAt() {
        return this.#lastAccessedAt;
    }

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was last updated (had its value changed)
     */
    get updatedAt() {
        return this.#updatedAt;
    }
}

export {
    CacheMeta
};
