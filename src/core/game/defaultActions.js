import { registerAction } from "./actions.js";

export function registerDefaultActions() {
  registerAction("buy-miner", (game) => {
    const cost = game.minerCost.value;
    if (game.gold.value < cost) return;

    game.gold.value -= cost;
    game.minerCount.value += 1;
    game.goldPerSec.value = 1 + game.minerCount.value * 0.5;
  });

  registerAction("harvest", (game) => {
    game.gold.value += 5;
  });
}
