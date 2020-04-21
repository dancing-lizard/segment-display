import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy";

const watching = process.env.ROLLUP_WATCH;
const debug = process.env.ROLLUP_WATCH || process.env.DEBUG;

const serveopts = {
    contentBase: ["./dist"],
    host: "0.0.0.0",
    port: 5000,
    allowCrossOrigin: true,
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
};

const plugins = [
    typescript({
        typescript: require("typescript"),
        objectHashIgnoreUnknownHack: true
    }),
    copy({
        targets: [{ src: "src/index.html", dest: "dist" }]
    }),
    watching && serve(serveopts),
    !debug && terser()
];

export default [
    {
        input: "src/segment-display.ts",
        output: {
            dir: "dist",
            format: "es"
        },
        plugins: [...plugins]
    }
];
