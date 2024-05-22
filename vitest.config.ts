import {coverageConfigDefaults, defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            include: ["src/js/**/*.js"],
            exclude: ["src/js/auth-server.js", "src/js/auth-server-config.js", "src/js/id-bot-private.js", "src/js/node-starter.js", ...coverageConfigDefaults.exclude],
            reportsDirectory: "./build/tests/coverage",
        },
        outputFile: "./build/tests/html/vitest.html",
        reporters: ["basic", "html"]
    },
})
