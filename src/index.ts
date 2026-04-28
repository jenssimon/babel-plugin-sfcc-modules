import t from "@babel/types"
import importsVisitor from "imports-visitor"
import fs from "node:fs"
import path from "node:path"

const SUPPORTED_EXTENSIONS = ["js", "ds", "json"]

type ImportLike = {
  source: string
}

type PluginOptions = {
  cartridgePath: string[]
  basePath: string
}

const getModulePath = (moduleName: string, basePath: string, cartridge: string, target: string) => {
  const relativePath = path.relative(path.dirname(moduleName), `${basePath}/${cartridge}${target}`)
  return (relativePath.includes(".") ? "" : "./") + relativePath
}

const plugin = (_babel: unknown, { cartridgePath, basePath }: PluginOptions) => ({
  visitor: {
    Program(thePath: any, state: any) {
      const imports: ImportLike[] = []
      thePath.traverse(importsVisitor, { imports })
      // eslint-disable-next-line no-restricted-syntax
      for (const imp of imports) {
        /**
         * Finds and sets the rewrittten module path.
         *
         * @param findCartridge  a function to find the cartridge
         */
        const resolve = (findCartridge: (target: string) => string | undefined) => {
          const target = imp.source.slice(1)
          const foundCartridge = findCartridge(target)
          if (foundCartridge) {
            imp.source = getModulePath(state.file.opts.filename, basePath, foundCartridge, target)
          }
        }

        // Handle
        //
        // require("*/cartridge/scripts/foo")
        //
        // Find the first cartridge that matches the requested module name
        //
        if (imp.source.indexOf("*/") === 0) {
          resolve((target) =>
            cartridgePath.find((cartridge) =>
              SUPPORTED_EXTENSIONS.find(
                // eslint-disable-next-line sonarjs/no-nested-functions
                (extension) => fs.existsSync(`${basePath}/${cartridge}${target}.${extension}`),
              ),
            ),
          )
        }

        // Handle
        //
        // require("~/cartridge/scripts/foo")
        //
        // Own cartridge - rewrites the module path to a relative URL.
        //
        if (imp.source.indexOf("~/") === 0) {
          resolve(
            () =>
              path.relative(basePath, path.dirname(state.file.opts.filename)).split(path.sep)[0],
          )
        }
      }
    },

    MemberExpression(thePath: any, state: any) {
      // Find "module.superModule"
      if (
        thePath.node.object.type === "Identifier" &&
        thePath.node.object.name === "module" &&
        thePath.node.property.name === "superModule"
      ) {
        // path to module relative to the cartridge base path
        const pathToModule = path.relative(basePath, state.file.opts.filename)

        // Path without cartridge name
        const shortenedPathParts = pathToModule.split(path.sep).slice(1)

        // Remove extension
        const lastPart = shortenedPathParts.at(-1)
        if (!lastPart) {
          return
        }
        shortenedPathParts[shortenedPathParts.length - 1] = lastPart.replace(/\.[^.]+$/, "")
        const shortenedPathToModule = `/${shortenedPathParts.join(path.sep)}`

        const cartridge = pathToModule.split(path.sep)[0] // the own cartridge name
        // all cartridges after the found cartridges in cartridge path
        const newCartridgePath = cartridgePath.slice(cartridgePath.indexOf(cartridge) + 1)

        // Find the the cartridge which contains the next match for the module path
        const foundCartridge = newCartridgePath.find((theCartridge) =>
          SUPPORTED_EXTENSIONS.find((extension) =>
            fs.existsSync(`${basePath}/${theCartridge}${shortenedPathToModule}.${extension}`),
          ),
        )

        let foundRequire: string | undefined
        if (foundCartridge) {
          foundRequire = getModulePath(
            state.file.opts.filename,
            basePath,
            foundCartridge,
            shortenedPathToModule,
          )
        }

        // Replace "module.superModule" with a require() or undefined
        thePath.replaceWith(
          foundRequire
            ? t.callExpression(t.identifier("require"), [t.stringLiteral(foundRequire)])
            : t.identifier("undefined"),
        )
      }
    },
  },
})

export default plugin
