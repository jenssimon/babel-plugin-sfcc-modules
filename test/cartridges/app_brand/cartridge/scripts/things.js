const base = module.superModule

function foo() {
  return ['badger'].concat(base())
}

module.exports = foo
