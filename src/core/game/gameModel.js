import { computed, ObservableValue } from "../observable.js";

export class GameModel {
  constructor() {
    this.gold = new ObservableValue(0);
    this.goldPerSec = new ObservableValue(1);

    this.minerCount = new ObservableValue(0);
    this.minerBaseCost = new ObservableValue(10);

    this.minerCost = computed(
      () =>
        Math.floor(
          this.minerBaseCost.value * Math.pow(1.15, this.minerCount.value)
        ),
      [this.minerBaseCost, this.minerCount]
    );

    this.canButMiner = computed(
      () => this.gold.value >= this.minerCost.value,
      [this.gold, this.minerCost]
    );
  }

  tick(dtSeconds) {
    this.gold.value = this.gold.value + this.goldPerSec.value * dtSeconds;
  }

  toJSON() {
    return {
      gold: this.gold.value,
      goldPerSec: this.goldPerSec.value,
      minerCount: this.minerCount.value,
      minerBaseCost: this.minerBaseCost.value,
    };
  }

  fromJSON(data) {
    if (data == null) {
      return;
    }

    if (typeof data.gold === "number") {
      this.gold.value = data.gold;
    }
    if (typeof data.goldPerSec === "number") {
      this.goldPerSec.value = data.goldPerSec;
    }
    if (typeof data.minerCount === "number") {
      this.minerCount.value = data.minerCount;
    }
    if (typeof data.minerBaseCost === "number") {
      this.minerBaseCost.value = data.minerBaseCost;
    }
  }
}
