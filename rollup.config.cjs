const typescript = require("@rollup/plugin-typescript");

/**
 * @type {import("rollup").RollupOptions}
 */
module.exports = {
    input: "index.ts",
    output: [
        {
            file: "dist/index.esm.js",
            format: "esm",
        },
        {
            file: "dist/index.umd.js",
            format: "umd",
            name: "Masonry",
        },
    ],
    plugins: [typescript()],
};
