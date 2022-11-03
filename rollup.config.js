import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
const path = require('path');
const license = require('rollup-plugin-license');

const terserOptions = {
    compress: {
        passes: 2
    }
};

module.exports = [
    {
        input: "src/index.js",
        output: [
            {
                file: "dist/googleTagLinker.amd.js",
                format: "amd"
            },
            {
                file: "dist/googleTagLinker.amd.min.js",
                format: "amd",
                plugins: [terser(terserOptions)]
            },

            {
                file: "dist/googleTagLinker.iife.js",
                name: "googleTagLinker",
                format: "iife"
            },
            {
                file: "dist/googleTagLinker.iife.min.js",
                name: "googleTagLinker",
                format: "iife",
                plugins: [terser(terserOptions)]
            },
            {
                file: "dist/googleTagLinker.js",
                name: "googleTagLinker",
                format: "umd"
            },
            {
                file: "dist/googleTagLinker.min.js",
                name: "googleTagLinker",
                format: "umd",
                plugins: [terser(terserOptions)]
            }
        ],
        plugins: [
            license({
                banner: `/*!
* 
*   <%= pkg.name %> <%= pkg.version %>
*   https://github.com/analytics-debugger/google-tag-linker
*
*   Copyright (c) David Vallejo (https://www.thyngster.com).
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/
`,
            }),            
            resolve(),
            babel({
                exclude: "node_modules/**"
            })
        ]
    },
    {
        input: "src/index.js",
        output: [
            {
                file: "dist/googleTagLinker.esm.js",
                format: "esm"
            },
            {
                file: "dist/googleTagLinker.esm.min.js",
                format: "esm",
                plugins: [terser(terserOptions)]
            }
        ]
    }
];
