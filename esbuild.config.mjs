import * as esbuild from "esbuild";

/**
 * @type {esbuild.BuildOptions}
 */
const config = {
    bundle: true,
    outdir: "dist",
    entryPoints: ["index.js"],
};

/**
 * @type {esbuild.Format[]}
 */
const formats = ["iife", "esm"];

for (const format of formats) {
    esbuild.buildSync({
        ...config,
        format,
        outExtension: {
            ".js": format === "iife" ? ".js" : `.${format}.js`,
        },
    });
}
