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
    #lastUpdatedAt;

    /**
     * @type *
     */
    #key;

    /**
     * @param  {*} key
     * @param  {number} createdAt
     * @param  {number} lastAccessedAt
     * @param  {number} lastUpdatedAt
     */
    constructor(key, createdAt, lastAccessedAt = undefined, lastUpdatedAt = undefined) {
        this.#key = key;
        this.#createdAt = createdAt;
        this.#lastAccessedAt = lastAccessedAt;
        this.#lastUpdatedAt = lastUpdatedAt;
    };

    /**
     * @returns {*}
     */
    get key() {
        return this.#key;
    };

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was created
     */
    get createdAt() {
        return this.#createdAt;
    };

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was last read
     */
    get lastAccessedAt() {
        return this.#lastAccessedAt;
    };

    /**
     * @returns {number} the UTC timestamp at which this cache mapping was last updated (had its value changed)
     */
    get lastUpdatedAt() {
        return this.#lastUpdatedAt;
    };

    toString() {
        return `CacheMeta(key=${this.#key} createdAt=${this.#createdAt} #lastAccessedAt=${this.#lastAccessedAt} lastUpdatedAt=${this.#lastUpdatedAt})`;
    };
}

export {
    CacheMeta
};
