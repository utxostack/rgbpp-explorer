/** @type {import('@lingui/conf').LinguiConfig} */
const linguiConfig = {
  locales: ["en", "zh-cn", "zh-tw"],
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
