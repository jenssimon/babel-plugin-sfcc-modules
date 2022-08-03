const fs = require('fs');
const path = require('path');

const importsVisitor = require('imports-visitor');
const t = require('@babel/types');

const SUPPORTED_EXTENSIONS = ['js', 'ds', 'json'];

const getModulePath = (moduleName, basePath, cartridge, target) => {
  const relPath = path.relative(
    path.dirname(moduleName),
    `${basePath}/${cartridge}${target}`,
  );
  return (!relPath.includes('.') ? './' : '') + relPath;
};

module.exports = (babel, { cartridgePath, basePath }) => ({
  visitor: {
    Program(thePath, state) {
      const imports = [];
      thePath.traverse(importsVisitor, { imports });
      imports.forEach((imp) => {
        /**
         * Finds and sets the rewrittten module path.
         *
         * @param findCartridge  a function to find the cartridge
         */
        const resolve = (findCartridge) => {
          const target = imp.source.slice(1);
          const foundCartridge = findCartridge(target);
          if (foundCartridge) {
            imp.source = getModulePath(state.file.opts.filename, basePath, foundCartridge, target);
          }
        };

        // Handle
        //
        // require('*/cartridge/scripts/foo')
        //
        // Find the first cartridge that matches the requested module name
        //
        if (imp.source.indexOf('*/') === 0) {
          resolve((target) => cartridgePath.find((cartridge) => SUPPORTED_EXTENSIONS
            .find((ext) => fs.existsSync(`${basePath}/${cartridge}${target}.${ext}`))));
        }

        // Handle
        //
        // require('~/cartridge/scripts/foo')
        //
        // Own cartridge - rewrites the module path to a relative URL.
        //
        if (imp.source.indexOf('~/') === 0) {
          resolve(() => path.relative(basePath, path.dirname(state.file.opts.filename)).split(path.sep)[0]);
        }
      });
    },

    MemberExpression(thePath, state) {
      // Find "module.superModule"
      if (thePath.node.object.type === 'Identifier'
          && thePath.node.object.name === 'module' && thePath.node.property.name === 'superModule') {
        // path to module relative to the cartridge base path
        const pathToModule = path.relative(basePath, state.file.opts.filename);

        // Path without cartridge name
        let shortendedPathToModule = pathToModule
          .split(path.sep)
          .slice(1);

        // Remove extension
        shortendedPathToModule[shortendedPathToModule.length - 1] = shortendedPathToModule[
          shortendedPathToModule.length - 1]
          .split('.');
        shortendedPathToModule[shortendedPathToModule.length - 1].pop();
        shortendedPathToModule[shortendedPathToModule.length - 1].join('.');
        shortendedPathToModule = `/${shortendedPathToModule.join(path.sep)}`;

        const cartridge = pathToModule.split(path.sep)[0]; // the own cartridge name
        // all cartridges after the found cartridges in cartridge path
        const newCartridgePath = cartridgePath.slice(cartridgePath.indexOf(cartridge) + 1);

        // Find the the cartridge which contains the next match for the module path
        const foundCartridge = newCartridgePath.find((theCartridge) => SUPPORTED_EXTENSIONS
          .find((ext) => fs.existsSync(`${basePath}/${theCartridge}${shortendedPathToModule}.${ext}`)));

        let foundRequire;
        if (foundCartridge) {
          foundRequire = getModulePath(state.file.opts.filename, basePath, foundCartridge, shortendedPathToModule);
        }

        // Replace "module.superModule" with a require() or undefined
        thePath.replaceWith(foundRequire
          ? t.callExpression(t.identifier('require'), [t.stringLiteral(foundRequire)])
          : t.identifier('undefined'));
      }
    },
  },
});
