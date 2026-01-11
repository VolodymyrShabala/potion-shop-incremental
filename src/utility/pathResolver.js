export function resolvePath(root, path) {
  return path.split(".").reduce((obj, key) => obj?.[key], root);
}
