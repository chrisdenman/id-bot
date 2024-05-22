const EXIT_CODE_NORMAL = 0;
const EXIT_CODE_ABNORMAL = -1;

/**
 * @typedef {typeof import('./id-bot.js')['IdBot']} IdBot
 */
class Application {

    #process;

    #idBot;

    /**
     *
     * @param {Process} process
     * @param {IdBot} idBot
     */
    constructor(process, idBot) {
        this.#process = process;
        this.#idBot = idBot;
        process.on("SIGTERM", this.terminate.bind(this));
        process.on("SIGINT", this.terminate.bind(this));
    }

    /**
     * @param {string} token
     */
    start(token) {
        this.#idBot.login(token);
    }

    stop() {
        this.#idBot.close();
        this.#process.exit(EXIT_CODE_NORMAL);
    }

    terminate() {
        this.#idBot.close();
        this.#process.exit(EXIT_CODE_ABNORMAL);
    }
}

export { Application };
