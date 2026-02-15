export function createBuffer() {
  return {
    _latest: null,
    push: function (item) {
      this._latest = item;
    },
    get: function () {
      return this._latest;
    },
  };
}
