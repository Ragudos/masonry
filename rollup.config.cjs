/**
 * @type {import("rollup").RollupOptions}
 */
module.exports = {
    input: "index.ts",
    output: [
        {
            dir: "dist",
            file: "index.esm.js",
            format: "esm",
        },
        {
            dir: "dist",
            file: "index.umd.js",
            format: "umd",
        },
    ],
};
