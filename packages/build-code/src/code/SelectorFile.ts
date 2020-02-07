// // virtualizable/mockable
// export class SelectorFile {
//   // load or create initial
//   // ----
//   // save
//   // ----
//   // revert

//   protected async _createInitialCode() {
//     const selectorsExist = await pathExists(this._selectorsPath);
//     if (selectorsExist) {
//       this._preexistingSelectors = await readJson(this._selectorsPath);
//     }
//   }

//   public async discard() {
//     // if (this._preexisting) {
//     //   console.log(yellow("reverted:"), this._selectorsPath);
//     //   await outputJson(this._selectorsPath, this._preexistingSelectors, {
//     //     spaces: " "
//     //   });
//     // } else {
//     //   await remove(this._selectorsPath);
//     // }
//   }

//   // public for tests
//   public async _updateSelectors() {
//     const selectors = this._preexistingSelectors || [];

//     this._updater._steps.forEach(step => {
//       const selector = stepToSelector(step);
//       // inline index so it is easy to correlate with the test
//       (selector as any).index = step.index;
//       selectors.push(selector);
//     });

//     await outputJson(this._selectorsPath, selectors, { spaces: " " });
//   }
// }
