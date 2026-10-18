const EMULATED = {
  'sdk': './sdk/index.js',
  'sdk/db': './sdk/db.js',
  'sdk/api': './sdk/api.js',
  'sdk/fetch': './sdk/fetch.js',
};

export async function resolve(specifier, context, nextResolve) {
  const target = EMULATED[specifier];
  if (target) {
    return { url: new URL(target, import.meta.url).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
