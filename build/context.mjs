import * as esbuild from "esbuild";
import path from "path";

const context = await esbuild.context({
    entryPoints: [
        path.join('source', 'main.ts')
    ],
    bundle: true,
    outfile: './dist/main.js',
    platform: 'node',
    target: 'node10.4',
    
})

export default context