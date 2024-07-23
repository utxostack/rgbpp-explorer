/** @type {import('@lingui/conf').LinguiConfig} */
const linguiConfig = {
  locales: ["en"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
  compileNamespace: 'ts',
}

export default linguiConfig;
