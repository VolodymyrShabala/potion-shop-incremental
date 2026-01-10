const registry = new Map();

/**
 * registerAction("buy-miner", (game, payload) => {...})
 */
export function registerAction(name, fn) {
  if (name == null || typeof fn !== "function") {
    throw new Error("registerAction requires (name, fn)");
  }
  if (registry.has(name)) {
    console.warn(`Action '${name}' overwritten`);
  }

  registry.set(name, fn);
}

export function handleAction(game, actionName, payload) {
  const fn = registry.get(actionName);
  if (fn == null) {
    console.warn("Unknown action: ", actionName);
    return;
  }

  fn(game, payload);
}

/**
 * Convenience: wire a DOM root to handle all <game-button> actions.
 */
export function attachActionListener(rootEl, getGame) {
  rootEl.addEventListener("game-action", (e) => {
    const game = getGame();
    if (game == null) {
      return;
    }

    handleAction(game, e.detail.action, e.detail.payload);
  });
}
