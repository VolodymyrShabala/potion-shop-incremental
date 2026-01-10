export class BindText extends HTMLElement {
  #unsub = null;

  connectCallback() {
    this, wire();
  }

  disconnectCallback() {
    this.#unsub?.();
    this.#unsub = null;
  }

  static get observedAttributes() {
    return ["key", "format"];
  }

  attributeChangedCallback() {
    this.#wire();
  }

  #wire() {
    this.disconnectCallback();

    const key = this.getAttribute("key");
    if (key == null) {
      return;
    }

    const game = window.game;
    const obs = game?.[key];
    if (obs == null || typeof obs.subscribe !== "function") {
      this.textContent = `Missing: ${key}`;
      return;
    }

    const format = this.getAttribute("format") || "raw";
    const formatValue = (v) => {
      if (format === "int") {
        return String(Math.floor(v));
      }
      if (format === "fixed2") {
        return Number(v).toFixed(2);
      }

      return String(v);
    };

    this.#unsub = obs.subscribe((v) => {
      this.textContent = formatValue(v);
    });
  }
}

customElements.define("bind-text", BindText);
