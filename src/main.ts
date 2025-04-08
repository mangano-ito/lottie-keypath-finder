import { text } from "node:stream/consumers";

import type { RawLottieObject } from './types.ts';
import { buildTree, renderTreeIntoString } from './lib.ts';

/**
 * load the Lottie Object from stdin
 * 
 * @returns the Lottie Object
 */
async function loadJsonFileFromStdin(): Promise<RawLottieObject> {
    const body = await text(process.stdin);
    const object = JSON.parse(body);

    return object;
}

/**
 * dump the Lottie KeyPath tree from stdin
 */
async function main(): Promise<void> {
    const object = await loadJsonFileFromStdin();
    const tree = buildTree(object);
    if (!tree) {
        console.error('<No Data>');
        return;
    }
    const treeAsString = renderTreeIntoString(tree);
    console.log(treeAsString);
}

await main();
