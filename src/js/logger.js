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

    #format = (message, level) => `${level ? (level + ":") : ":"}${this.#prefix ? (this.#prefix + ":") : ":"}${message}`;

    /**
     * @param {*} message
     */
    info = message => this.#console.info(this.#format(message, "INFO"));

    /**
     * @param {*} message
     */
    log = message => this.#console.log(this.#format(message, "log"));

    /**
     * @param {*} message
     */
    debug = message => this.#console.debug(this.#format(message, "debug"));

    /**
     * @param {*} message
     * @param {*} [error]
     */
    error = ((message, error) => {
        this.#console.error(this.#format(message, "ERROR"));
        if (error) {
            this.#console.error(error);
        }
    });

    /**
     * @param {*} message
     */
    warn = message => this.#console.warn(this.#format(message, "WARN"));
}

export {Logger};
