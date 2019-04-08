const hello = require('./cartridges/app_core/cartridge/scripts/hello');
const hallo = require('./cartridges/app_core/cartridge/scripts/hallo');
const bonjour = require('./cartridges/app_core/cartridge/scripts/bonjour');
const petstore = require('./cartridges/app_core/cartridge/scripts/petstore');
const things = require('./cartridges/app_brand/cartridge/scripts/things');

describe('babel-plugin-sfcc-modules', () => {
  it('can handle require(\'*\') with a module in cartridge path behind.', () => {
    expect(hello).toEqual('Hello World');
  });

  it('can handle require(\'*\') with a module in cartridge path before', () => {
    expect(hallo).toEqual('Hallo Welt');
  });

  it('can handle require(\'*\') with a module in the same cartridge in cartridge path', () => {
    expect(bonjour).toEqual('Bonjour monde');
  });

  it('can handle require(\'^\')', () => {
    expect(petstore).toEqual('Cat');
  });

  it('can handle module.exports', () => {
    expect(things()).toEqual(['badger', 'mushroom', 'snake']);
  });
});
