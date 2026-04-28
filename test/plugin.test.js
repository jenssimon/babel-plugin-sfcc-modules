import { createRequire } from "node:module"
import { describe, expect, it } from "vite-plus/test"

import plugin from "../src/index.ts"

const require = createRequire(import.meta.url)

require("@babel/register")({
  extensions: [".js"],
  ignore: [/node_modules/],
  plugins: [
    [
      plugin,
      {
        cartridgePath: ["app_brand", "app_core", "app_storefront_base"],
        basePath: "./test/cartridges",
      },
    ],
  ],
})

const hello = require("./cartridges/app_core/cartridge/scripts/hello")
const hallo = require("./cartridges/app_core/cartridge/scripts/hallo")
const bonjour = require("./cartridges/app_core/cartridge/scripts/bonjour")
const petstore = require("./cartridges/app_core/cartridge/scripts/petstore")
const things = require("./cartridges/app_brand/cartridge/scripts/things")

describe("babel-plugin-sfcc-modules", () => {
  it("can handle require('*') with a module in cartridge path behind.", () => {
    expect(hello).toBe("Hello World")
  })

  it("can handle require('*') with a module in cartridge path before", () => {
    expect(hallo).toBe("Hallo Welt")
  })

  it("can handle require('*') with a module in the same cartridge in cartridge path", () => {
    expect(bonjour).toBe("Bonjour monde")
  })

  it("can handle require('^')", () => {
    expect(petstore).toBe("Cat")
  })

  it("can handle module.exports", () => {
    expect(things()).toStrictEqual(["badger", "mushroom", "snake"])
  })
})
