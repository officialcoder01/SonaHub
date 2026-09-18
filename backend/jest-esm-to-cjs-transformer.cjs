const transformImportsAndExports = (source) => {
  let output = source
    .replace(/^import\s+type\s+[^;]+;?$/gm, "")
    .replace(/^export\s+type\s+[^;]+;?$/gm, "")
    .replace(/^interface\s+[A-Za-z0-9_$]+\s*\{[\s\S]*?^\}/gm, "")
    .replace(/import\s+\{\s*Prisma,\s*User,\s*Role\s*\}\s+from\s+["']@prisma\/client["'];?/g, "")
    .replace(/\?\s*:\s*string/g, "")
    .replace(/:\s*(CorsOptions|ErrorRequestHandler|string|boolean|number)(?=\s*[,)=;{])/g, "")
    .replace(/:\s*(RegisterUserData|LoginUserData|User|Role|unknown)(?=\s*[,)=;{])/g, "")
    .replace(/:\s*User\s*\|\s*null/g, "")
    .replace(/\):\s*string\s*\|\s*null/g, ")")
    .replace(/\):\s*boolean/g, ")")
    .replace(/\):\s*Promise<[^>]+>/g, ")")
    .replace(/:\s*Prisma\.TransactionClient(?=\s*\))/g, "")
    .replace(/\s+as\s+const\b/g, "")
    .replace(/\(allowedOrigin\):\s*allowedOrigin\s+is\s+string/g, "(allowedOrigin)");

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
