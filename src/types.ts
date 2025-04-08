export type RawLottieObject = any;
export type Key = string;
export type KeyPathNode = {
    key: Key;
    children: KeyPathNode[];
};
export type PreCompMap = Map<string, RawLottieObject>;
export type BuildContext = {
    precompById: PreCompMap;
    parent: KeyPathNode;
}
