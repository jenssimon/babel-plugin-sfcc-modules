const base = module.superModule;

module.exports = function () {
  return ['badger'].concat(base());
};
