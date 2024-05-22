import {Factory} from "./factory.js";

const env = process.env;
const id = env["id_bot_id"];
const token = env["id_bot_token"];
new Factory().createApplication(id).start(token);
