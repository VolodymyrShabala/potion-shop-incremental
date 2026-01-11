// import { computed, ObservableValue } from "../../observable.js";

// export class Miner {
//   constructor(game) {
//     this.game = game;

//     this.count = new ObservableValue(0);
//     this.baseCost = 10;

//     this.cost = computed(
//       () => Math.floor(this.baseCost * Math.pow(1.15, this.count.value)),
//       [this.count]
//     );

//     this.goldPerSec = computed(() => this.count.value * 0.5, [this.count]);
//     this.canBuy = computed(
//       () => this.game.gold.value >= this.cost.value,
//       [this.game.gold, this.cost]
//     );
//   }

//   buy() {
//     if (this.canBuy.value === false) {
//       return;
//     }

//     this.game.gold.value -= this.cost.value;
//     this.count.value++;
//   }

//   sell() {
//     if (this.count.value <= 0) {
//       return;
//     }
//     this.count.value--;
//     this.game.gold.value += Math.floor(this.cost.value * 0.5);
//   }

//   toJSON() {
//     return {
//       count: this.count.value,
//     };
//   }

//   fromJSON(data) {
//     if (data == null) {
//       return;
//     }

//     this.count = data.count;
//   }
// }
