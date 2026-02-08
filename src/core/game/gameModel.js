export class GameModel {
    constructor() {
        this.currencies = {};
        this.buildings = {};
    }

    currency(id) {
        return this.currencies[id];
    }

    // TODO V: Check if I want to move to a signal system instead of resetting income every update
    tick(dtSeconds) {
        // V: Reset income
        for (const currency of Object.values(this.currencies)) {
            currency.resetIncome();
        }

        // V: Recalculate income
        for (const building of Object.values(this.buildings)) {
            const rates = building.getRatesPerSec();
            for (const [id, value] of Object.entries(rates)) {
                this.currencies[id].amountPerSec.value += value;
            }
        }

        // V: Add income
        for (const currency of Object.values(this.currencies)) {
            currency.amount.value += currency.amountPerSec.value * dtSeconds;
        }
    }

    addCurrencyManually() {
        Object.values(this.currencies)[0].amount.value += 5;
    }

    toJSON() {
        return {
            currencies: Object.fromEntries(
                Object.entries(this.currencies).map(([id, currency]) => [
                    id,
                    currency.toJSON(),
                ])
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
                if (this.currencies[id]) {
                    this.currencies[id].fromJSON(value);
                }
            }
        }
        if (data.buildings) {
            for (const [id, building] of Object.entries(data.buildings)) {
                if (this.buildings[id]) {
                    this.buildings[id].fromJSON(building);
                }
            }
        }
    }
}
