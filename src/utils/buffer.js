export function createBuffer() {
  return {
    _latest: null,
    push: function (item) {
      this._latest = item;
      // console.log('Buffer updated with frame:', item.frame); // Optional debug
    },
    get: function () {
      return this._latest;
    },
  };
}
