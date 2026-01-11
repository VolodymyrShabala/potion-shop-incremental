import { loadPartialsIntoApp, fetchText } from "./core/templateLoader.js";
import { GameModel } from "./core/game/gameModel.js";

// V: Register components (side-effect imports)
import "./core/ui/bind-text.js";
import "./core/ui/game-button.js";
import "./core/ui/tab-view.js";
import "./core/ui/cost-list.js";

import { loadContent } from "./core/game/loadContent.js";

const app = document.getElementById("app");

window.game = new GameModel();

await loadContent(window.game);

await loadPartialsIntoApp(app);

// V: Load tab contents from patrial files
document.getElementById("tab-game").innerHTML = await fetchText(
  "./partials/game.html"
);
document.getElementById("tab-graphs").innerHTML = await fetchText(
  "./partials/graphs.html"
);

const tabView = document.querySelector("tab-view");
tabView.setAttribute("ready", "");

// V: Save/load/reset
const SAVE_KEY = "inc_save_v1";

document.getElementById("saveButton").onclick = () => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(window.game.toJSON()));
  console.log(JSON.stringify(window.game.toJSON()));
};

document.getElementById("loadButton").onclick = () => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw == null) {
    return;
  }
  window.game.fromJSON(JSON.parse(raw));
};

document.getElementById("resetButton").onclick = () => {
  localStorage.removeItem(SAVE_KEY);
  window.game = new GameModel();
  location.reload();
};

// V: Tick loop
let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;
  window.game.tick(dt);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
