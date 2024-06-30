class CacheMaxStaleManager {

    /**
     * @type {Cache}
     */
    #cache;

    /**
     * @type {Logger}
     */
    #logger;

    /**
     * @type {Factory}
     */
    #factory;

    /**
     *
     * @type {number}
     */
    #state = -1;

    /**
     * @type number
     */
    #maxStaleLifetimeMilliSeconds;

    /**
     * @type {number}
     */
    #tickIntervalDurationMilliSeconds;

    #intervalId;

    /**
     * @type boolean
     */
    #eternal;

    /**
     * Create an expirator which enforces cache-entries only remain stale for a maximum (or infinite) duration.
     *
     * @param {Cache} cache the cache to manage
     * @param {Logger} logger the logger to use for logging interesting facts
     * @param {Factory} factory
     * @param {number} [tickIntervalDurationMilliSeconds] the
     * @param {number} [maxStaleLifetimeMilliSeconds] the
     */
    constructor(
        cache,
        logger,
        factory,
        tickIntervalDurationMilliSeconds = 100,
        maxStaleLifetimeMilliSeconds = undefined
    ) {
        this.#cache = cache;
        this.#logger = logger;
        this.#factory = factory;
        this.#tickIntervalDurationMilliSeconds = tickIntervalDurationMilliSeconds;
        this.#maxStaleLifetimeMilliSeconds = maxStaleLifetimeMilliSeconds;
        this.#eternal = this.#maxStaleLifetimeMilliSeconds === undefined;
    }

    #expireStaleCacheEntries() {
        const NOW = this.#factory.getNowInMilliSeconds;
        [...this.#cache.metaData]
            .filter(it => NOW - it.lastAccessedAt > this.#maxStaleLifetimeMilliSeconds)
            .map(it => {
                this.#cache.remove(it.key);
                this.#logger.debug(`Expired key ${it.key}`);
            });
    }

    start() {
        if (this.#state !== 1) {
            if (!this.#eternal) {
                this.#intervalId = setInterval(
                    this.#expireStaleCacheEntries.bind(this),
                    this.#tickIntervalDurationMilliSeconds
                );
            }
            this.#state = 1;
        }
    }

    stop() {
        if (this.#state === 1) {
            if (!this.#eternal) {
                clearInterval(this.#intervalId);
                this.#intervalId = undefined;
            }
            this.#state = 0;
        }
    }
}

export {
    CacheMaxStaleManager
};
