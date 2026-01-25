import { computed, ObservableValue } from '../observable.js';

export class Building {
    #isUnlocked = false;

    constructor(game, config) {
        this.game = game;
        this.config = config;

        this.id = config.id;
        this.name = config.name;

        this.count = new ObservableValue(0);

        this.cost = {};
        for (const [currencyID, curve] of Object.entries(config.cost ?? {})) {
            this.cost[currencyID] = computed(
                () =>
                    Math.floor(
                        curve.base * Math.pow(curve.scale, this.count.value)
                    ),
                [this.count]
            );
        }

        this.isUnlocked = computed(
            () => this.#isUnlocked || checkUnlock(game, config.unlock),
            unlockDependencies(game, config.unlock)
        );

        this.isUnlocked.subscribe((unlocked) => {
            if (unlocked) {
                this.#isUnlocked = true;

                // V: Unlock currencies
                const prod = this.config.production ?? {};
                for (const currencyID of Object.keys(prod)) {
                    const currency = game.currencies[currencyID];
                    if (currency && currency.isUnlocked.value === false) {
                        currency.isUnlocked.value = true;
                    }
                }
            }
        });

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
        if (this.isUnlocked.value === false) {
            return;
        }

        if (this.canBuy.value == null) {
            return;
        }

        // TODO V: Move purchasing outside of the building.
        for (const [currencyID, costObject] of Object.entries(this.cost)) {
            this.game.currencies[currencyID].amount.value -= costObject.value;
        }

        this.count.value += 1;
    }

    getRatesPerSec() {
        if (this.isUnlocked.value == false) {
            return {};
        }

        const production = this.config.production ?? {};
        const result = {};
        for (const [currencyID, perSecPerUnit] of Object.entries(production)) {
            result[currencyID] = perSecPerUnit * this.count.value;
        }

        return result;
    }

    toJSON() {
        return {
            count: this.count.value,
            isUnlocked: this.#isUnlocked,
        };
    }

    fromJSON(data) {
        if (data == null) {
            console.error('Faield to load data for: ', this.name);
        }

        if (typeof data.count === 'number') {
            this.count.value = data.count;
        }

        if (typeof data.isUnlocked === 'boolean') {
            this.#isUnlocked = data.isUnlocked;
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
