import { defineConfig } from "rollup";
import image from "@rollup/plugin-image";
import ts from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";

import artTemplate from "./rollup-plugin-art-template";

import lodashPlugin from "babel-plugin-lodash";
import { INPUT, DEV_OUTPUT_DIR, LIB_NAME } from "./global.config.js";

export default defineConfig({
    input: INPUT,
    output: {
        name: LIB_NAME, // The library's name. This name will be used for window.myLibName.
        file: DEV_OUTPUT_DIR + LIB_NAME.toLowerCase() + ".umd.js",
        format: "umd",
        sourcemap: true,
    },
    external: ["flv.js"],
    plugins: [
        ts(),
        artTemplate({
            options: { escape: false },
        }),
        image(),
        postcss(),
        nodeResolve(),
        commonjs(),
        babel({
            presets: [["@babel/preset-env", { modules: false }]],
            plugins: [lodashPlugin],
            exclude: "/node_modules/",
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
        livereload(),
        serve(DEV_OUTPUT_DIR),
    ],
});
