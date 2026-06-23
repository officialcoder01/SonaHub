const transformImportsAndExports = (source) => {
  let output = source;

  output = output.replace(
    /^import\s+["']([^"']+)["'];?$/gm,
    'require("$1");'
  );

  output = output.replace(
    /^import\s+([A-Za-z0-9_$]+)\s+from\s+["']([^"']+)["'];?$/gm,
    'const $1Module = require("$2");\nconst $1 = $1Module.default || $1Module;'
  );

  output = output.replace(
    /^import\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["'];?$/gm,
    'const { $1 } = require("$2");'
  );

  output = output.replace(
    /^export\s+const\s+([A-Za-z0-9_$]+)\s*=\s*/gm,
    "const $1 = exports.$1 = "
  );

  output = output.replace(
    /^export\s+default\s+([A-Za-z0-9_$]+);?$/gm,
    "exports.default = $1;"
  );

  return output;
};

module.exports = {
  process(sourceText) {
    return {
      code: transformImportsAndExports(sourceText),
    };
  },
};
