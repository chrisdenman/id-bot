import express from "express";

import {AUTH_SERVER_CONFIG} from "./auth-server-config.js";

const app = express();

app.get("/", (request, response) => {
    return response.sendFile("index.html", { root: AUTH_SERVER_CONFIG.rootHtmlDirectory });
});

app.listen(AUTH_SERVER_CONFIG.port, () => console.log(`App listening on :${AUTH_SERVER_CONFIG.port}`));
