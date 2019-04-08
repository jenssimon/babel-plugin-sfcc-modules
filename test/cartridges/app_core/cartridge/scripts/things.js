const base = module.superModule;

module.exports = function () {
  return ['mushroom'].concat(base());
};
