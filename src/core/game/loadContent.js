import { ObservableValue } from "../observable.js";
import { Building } from "./buildings/building.js";

// TODO V: Let gameModel handle that
export async function loadContent(game) {
  const currencies = await fetch("../../../data/currencies.json").then((r) =>
    r.json()
  );
  for (const currency of currencies) {
    game.currencies[currency.id] = {
      name: currency.name,
      amount: new ObservableValue(currency.start ?? 0),
      amountPerSec: new ObservableValue(currency.perSec ?? 0),
    };
  }

  const buildingIDs = ["miner", "wizard_tower"];
  for (const id of buildingIDs) {
    const cfg = await fetch(`../../../data/buildings/${id}.json`).then((r) =>
      r.json()
    );
    game.buildings[id] = new Building(game, cfg);
  }

  console.log("Currencies ", game.currencies);
  console.log("Buildings ", game.buildings);
}
