import {Factory} from "./factory.js";
import {CONFIG as PRIVATE_CONFIG} from "./id-bot-private.js";

new Factory().createApplication(PRIVATE_CONFIG.id).start(PRIVATE_CONFIG.token);
