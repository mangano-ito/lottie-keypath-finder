import type { KeyPathNode } from './types.ts';
import { buildTree, renderTreeIntoString } from './lib.ts';

/**
 * get the input object from the file input
 * 
 * @returns the input object from the file input
 */
async function getInput(): Promise<Object> {
    const input = document.getElementById('input') as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (!selectedFile) {
        throw new Error('No file selected.');
    }
    const body = await selectedFile.text();

    return JSON.parse(body);
}

/**
 * render the KeyPath tree into the result element
 * 
 * @param tree the KeyPath tree to build
 */
function renderResult(tree: KeyPathNode) {
    const result = document.getElementById('result') as HTMLPreElement;
    const treeAsString = renderTreeIntoString(tree);
    result.innerText = treeAsString;
}

/**
 * render the error message
 * 
 * @param error the error to render
 */
function renderError(error: Error) {
    const result = document.getElementById('result') as HTMLPreElement;
    result.innerText = error.message;
}

/**
 * generate the result from the input
 */
async function generateResult() {
    const object = await getInput();
    const tree = buildTree(object);
    if (!tree) {
        throw new Error('No Data.');
    }
    renderResult(tree);
}

/**
 * setup the event listeners
 */
function setup() {
    const lookupButton = document.getElementById('lookup-btn') as HTMLButtonElement;
    lookupButton.addEventListener('click', () => {
        try {
            generateResult();
        } catch (error) {
            if (error instanceof Error) {
                renderError(error);
            } else {
                console.error(error);
            }
        }
    });
}

setup();
