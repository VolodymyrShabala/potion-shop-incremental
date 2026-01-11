// import { computed, ObservableValue } from "../observable.js";
// import { Miner } from "./buildings/miner.js";

export class GameModel {
  constructor() {
    this.currencies = {};
    this.buildings = {};

    // this.goldPerSec = computed(
    //   () => this.miner.goldPerSec.value + 1,
    //   [this.miner.goldPerSec]
    // );
  }

  currency(id) {
    return this.currencies[id];
  }

  tick(dtSeconds) {
    for (const building of Object.values(this.buildings)) {
      building.tick(dtSeconds);
    }
    // this.gold.value += this.goldPerSec.value * dtSeconds;
  }

  addCurrencyManually() {
    this.currencies["gold"].amount.value += 5;
  }

  toJSON() {
    return {
      currencies: Object.fromEntries(
        Object.entries(this.currencies).map(([id, obs]) => [id, obs.value])
      ),
      buildings: Object.fromEntries(
        Object.entries(this.buildings).map(([id, building]) => [
          id,
          building.toJSON(),
        ])
      ),
    };
  }

  fromJSON(data) {
    if (data == null) {
      return;
    }

    if (data.currencies) {
      for (const [id, value] of Object.entries(data.currencies)) {
        if (this.currencies[id] && typeof value === "number") {
          this.currencies[id].value = value;
        }
      }
    }
    if (data.buildings) {
      for (const [id, building] of Object.entries(data.buildings)) {
        if (this.buildings[id]) {
          console.log("Type of building", typeof building);
          this.buildings[id].fromJSON(building);
        }
      }
    }
  }
}
