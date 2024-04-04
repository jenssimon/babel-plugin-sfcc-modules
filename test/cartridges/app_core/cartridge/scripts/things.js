const base = module.superModule

function foo() {
  return ['mushroom'].concat(base())
}

module.exports = foo
