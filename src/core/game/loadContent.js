import { ObservableValue } from '../observable.js';
import { Building } from './building.js';
import { Currency } from './currency.js';

export async function loadContent(game) {
    await loadCurrencies(game);
    await loadBuildings(game);
}

async function loadCurrencies(game) {
    const currencies = await fetch('../../../data/currencies.json').then((r) =>
        r.json()
    );
    for (const currency of currencies) {
        game.currencies[currency.id] = new Currency(currency);
    }
}

async function loadBuildings(game) {
    const buildingIDs = await fetch('./data/buildings/index.json').then((r) =>
        r.json()
    );

    for (const id of buildingIDs.buildings) {
        const cfg = await fetch(`./data/buildings/${id}.json`).then((r) =>
            r.json()
        );
        game.buildings[id] = new Building(game, cfg);
    }
}
