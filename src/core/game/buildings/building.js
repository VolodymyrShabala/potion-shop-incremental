import { computed, ObservableValue } from "../../observable.js";

export class Building {
  constructor(game, config) {
    this.game = game;
    this.config = config;

    this.id = config.id;
    this.name = config.name;

    this.count = new ObservableValue(0);

    this.cost = {};
    for (const [currencyID, curve] of Object.entries(config.cost ?? {})) {
      this.cost[currencyID] = computed(
        () => Math.floor(curve.base * Math.pow(curve.scale, this.count.value)),
        [this.count]
      );
    }

    this.isUnlocked = computed(
      () => checkUnlock(game, config.unlock),
      unlockDependencies(game, config.unlock)
    );
    console.log(
      "Building: ",
      this.name,
      "is unlocked: ",
      this.isUnlocked.value
    );

    this.canBuy = computed(
      () => this.isUnlocked.value && canAfford(game, this.cost),
      [
        this.isUnlocked,
        ...Object.values(game.currencies).map((c) => c.amount),
        ...Object.values(this.cost),
      ]
    );

    this.costCurrencyIDs = Object.keys(this.cost);
  }

  buy() {
    if (this.isUnlocked.value == false) {
      return;
    }

    if (this.canBuy.value == null) {
      return;
    }

    // TODO V: Move purchasing outside of the building.
    for (const [currencyID, costObject] of Object.entries(this.cost)) {
      this.game.currencies[currencyID].amount.value -= costObject.value;
    }

    // TODO V: This is weird. Need to handle displaying currency/sec better
    const production = this.config.production ?? {};
    for (const [currencyID, perSecPerUnit] of Object.entries(production)) {
      const currency = this.game.currencies[currencyID];
      if (currency == null) {
        continue;
      }
      currency.amountPerSec.value += perSecPerUnit;
    }

    this.count.value += 1;
  }

  tick(dtSeconds) {
    if (this.isUnlocked.value == false) {
      return;
    }
    const production = this.config.production ?? {};
    for (const [currencyID, perSecPerUnit] of Object.entries(production)) {
      const currency = this.game.currencies[currencyID];
      if (currency == null) {
        continue;
      }
      currency.amount.value += perSecPerUnit * this.count.value * dtSeconds;
    }
  }
}

function canAfford(game, costMap) {
  for (const [currencyID, costObject] of Object.entries(costMap)) {
    const currency = game.currencies[currencyID];
    if (currency == null) {
      return false;
    }

    if (currency.amount.value < costObject.value) {
      return false;
    }
  }
  return true;
}

function checkUnlock(game, unlock) {
  if (unlock == null) {
    return true;
  }

  const currencyRequirements = unlock.currencyAtLeast ?? {};
  for (const [currencyID, min] of Object.entries(currencyRequirements)) {
    const currency = game.currencies[currencyID];
    if (currency == null || currency.amount.value < min) {
      return false;
    }
  }

  const buildingRequirements = unlock.buildingCountAtLeast ?? {};
  for (const [buildingID, min] of Object.entries(buildingRequirements)) {
    const building = game.buildings[buildingID];
    if (building == null || building.count.value < min) {
      return false;
    }
  }

  return true;
}

function unlockDependencies(game, unlock) {
  const dependencies = [];
  if (unlock == null) {
    return dependencies;
  }

  for (const currencyID of Object.keys(unlock.currencyAtLeast ?? {})) {
    if (game.currencies[currencyID]) {
      dependencies.push(game.currencies[currencyID].amount);
    }
  }

  for (const buildingID of Object.keys(unlock.buildingCountAtLeast ?? {})) {
    if (game.buildings[buildingID]) {
      dependencies.push(game.buildings[buildingID].count);
    }
  }

  return dependencies;
}
