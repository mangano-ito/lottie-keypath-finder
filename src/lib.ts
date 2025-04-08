import type {
    Key,
    KeyPathNode,
    RawLottieObject,
    PreCompMap,
    BuildContext,
} from './types.ts';

/**
 * get key of Lottie object
 *
 * @param object the Lottie object to get the key from
 * @returns the key if found, otherwise undefined
 */
function getKeyByObject(object: RawLottieObject): Key | undefined {
    return object['nm'];
}

/**
 * get precomp map
 *
 * @param object the Lottie object to get the precomp from
 * @returns the precomp map
 */
function getPreCompMap(object: RawLottieObject): PreCompMap {
    return Map.groupBy(object['assets'] || [], (asset: any) => asset['id']);
}

/**
 * create a new KeyPathNode
 * 
 * @param key the key of the node
 * @param children the children of the node (default: empty)
 * @returns a new KeyPathNode
 */
function createNode(key: Key, children: KeyPathNode[] = []): KeyPathNode {
    return { key, children, };
}

/**
 * create a new BuildContext
 * 
 * @param precompById the precomp map
 * @param parent the parent node
 * @returns a new BuildContext
 */
function createBuildContext(precompById: PreCompMap, parent: KeyPathNode): BuildContext {
    return { precompById, parent };
}

/**
 * resolve the self object from the context and the referencing object
 * 
 * @param object the object to resolve
 * @param context the build context
 * @returns the resolved self object
 */
function resolveSelf(object: RawLottieObject, context: BuildContext): RawLottieObject {
    const { precompById } = context;
    const referencedPrecomp = precompById.get(object['refId'] || '');

    // we have to use the precomp as the self node instead if the reference is found.
    const self = referencedPrecomp || object;

    return self;
}

/**
 * get the reference node.
 * starts a new tree if needed.
 * 
 * @param object the current object
 * @param context the build context
 * @returns the reference node
 */
function getOrCreateRefNode(object: RawLottieObject, context: BuildContext): KeyPathNode {
    const parent = context.parent;
    const key = getKeyByObject(object);
    const shouldStartNewTree = key !== undefined;

    // we need to start a new tree only when the key is found.
    let refNode = parent;
    if (shouldStartNewTree) {
        refNode = createNode(key);
        parent.children.push(refNode);
    }

    return refNode;
}

/**
 * traverse the object to build the child tree recursively
 * 
 * @param child the child to traverse
 * @param childContext the child build context
 */
function traverseChild(child: any, childContext: BuildContext): void {
    if (typeof child === 'object' && child !== null) {
        buildNode(child, childContext);
    } else if (Array.isArray(child)) {
        child.map((item) => traverseChild(item, childContext)).flat();
    }
}

/**
 * build a KeyPathNode from the object of interest
 * 
 * @param object the object to build the node from
 * @param context the build context
 * @returns the KeyPathNode
 */
function buildNode(object: RawLottieObject, context: BuildContext): KeyPathNode {
    const { precompById } = context;
    const self = resolveSelf(object, context);
    const refNode = getOrCreateRefNode(self, context);
    const children = Object.values(self);
    const childContext = createBuildContext(precompById, refNode);
    for (const child of children) {
        traverseChild(child, childContext);
    }

    return refNode;
}

/**
 * traverse the object recursively and build the KeyPath tree
 *
 * @param object the object to get the keyPaths from
 * @returns the keyPath tree
 */
export function buildTree(object: RawLottieObject): KeyPathNode {
    // build the PreComp map first so that we can resolve node references later.
    const precompById = getPreCompMap(object);
    // and, we don't need the assets anymore.
    delete object['assets'];

    const rootKey = getKeyByObject(object);
    if (!rootKey) {
        throw new Error('No root key found');
    }

    const rootNode = createNode(rootKey);
    const context = createBuildContext(precompById, rootNode);
    const tree = buildNode(object, context);

    return tree;
}

/**
 * render KeyPath tree into a string
 *
 * @param tree the KeyPath tree to dump
 * @param indent indentation string to prepend
 * @returns the rendered KeyPath tree string
 */
export function renderTreeIntoString(tree: KeyPathNode, indent: string = ''): string {
    const base = `${indent}${tree.key}\n`;
    const childIndent = indent + '  ';

    return tree.children.reduce(
        (result, child) => result + renderTreeIntoString(child, childIndent),
        base,
    );
}
