import { resolvePath } from "../../utility/pathResolver.js";

export class CostList extends HTMLElement {
  #unsubs = [];

  connectedCallback() {
    this.#wire();
  }

  disconnectedCallback() {
    for (const fn of this.#unsubs) {
      fn();
    }
    this.#unsubs = [];
  }

  static get observedAttributes() {
    return ["path"];
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#wire();
    }
  }

  #wire() {
    this.disconnectedCallback();

    const path = this.getAttribute("path");
    if (path == null) {
      return;
    }

    const building = resolvePath(window.game, path);
    if (
      building == null ||
      building.cost == null ||
      building.costCurrencyIDs == null
    ) {
      this.textContent = `Missing: ${path}`;
      return;
    }

    const parts = [];
    building.costCurrencyIDs.forEach((currencyID, index) => {
      const costObservable = building.cost[currencyID];
      const currencyName =
        window.game.currencies[currencyID].name ?? currencyID;

      const span = document.createElement("span");

      const num = document.createElement("strong");
      const label = document.createElement("span");
      label.textContent = ` ${currencyName}`;

      span.appendChild(num);
      span.appendChild(label);

      if (index > 0) {
        parts.push(document.createTextNode(" + "));
      }

      parts.push(span);

      if (costObservable && typeof costObservable.subscribe === "function") {
        this.#unsubs.push(
          costObservable.subscribe((v) => {
            num.textContent = String(Math.floor(v));
          })
        );
      } else {
        num.textContent = "?";
      }
    });

    this.replaceChildren(...parts);
  }
}

customElements.define("cost-list", CostList);
