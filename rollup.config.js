import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
// import typescript from 'rollup-plugin-typescript2';
import dts from "rollup-plugin-dts";
import json from "@rollup/plugin-json";
import css from "rollup-plugin-import-css";
import postcss from 'rollup-plugin-postcss'

import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), 'utf8'));

export default [
    {
        input: "./src/index.ts",
        output: [
            {
                dir: "dist/cjs",
                format: "cjs",
                sourcemap: true,
            },
            {
                dir: "dist/esm",
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
            css(),
            json()
        ],
    },
    {
        input: "dist/esm/types/index.d.ts",
        output: [{ dir: "dist", format: "esm" }],
        plugins: [dts(), json(), css(), postcss()],
    },
];