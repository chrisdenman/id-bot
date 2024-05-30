class Logger {

    #console;

    /**
     * @type string
     */
    #prefix;

    /**
     * @param {Console} console - the console to log to
     * @param {string} [prefix] - an optional logger prefix
     */
    constructor(console, prefix) {
        this.#console = console;
        this.#prefix = prefix;
    }

    #format = message => `${this.#prefix ? (this.#prefix + ": ") : ""}${message}`;

    /**
     * @param {string} message
     */
    info = message => this.#console.info(this.#format(message));

    /**
     * @param {string} message
     */
    log = message => this.#console.log(this.#format(message));

    /**
     * @param {string} message
     */
    debug = message => this.#console.debug(this.#format(message));

    /**
     * @param {string} message
     * @param {*} [error]
     */
    error = ((message, error) => {
        this.#console.error(this.#format(message));
        if (error) {
            this.#console.error(error);
        }
    });

    /**
     * @param {string} message
     */
    warn = message => this.#console.warn(this.#format(message));
}

export {Logger};
