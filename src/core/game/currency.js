import { ObservableValue } from '../observable.js';

export class Currency {
    #baseIncome = 0;

    constructor(data) {
        this.name = data.name;
        this.#baseIncome = data.perSec;
        this.isUnlocked = new ObservableValue(data.isUnlocked ?? false);
        this.amount = new ObservableValue(data.start ?? 0);
        this.amountPerSec = new ObservableValue(this.#baseIncome ?? 0);
    }

    resetIncome() {
        this.amountPerSec.value = this.#baseIncome;
    }

    toJSON() {
        return {
            amount: this.amount.value,
            amountPerSec: this.amountPerSec.value,
            isUnlocked: this.isUnlocked.value,
        };
    }

    fromJSON(data) {
        if (data == null) {
            console.error('Failed to load data for: ', this.name);
        }

        if (typeof data.amount === 'number') {
            this.amount.value = data.amount;
        }
        if (typeof data.amountPerSec === 'number') {
            this.amountPerSec.value = data.amountPerSec;
        }
        if (typeof data.isUnlocked === 'boolean') {
            this.isUnlocked.value = true;
        }
    }
}
