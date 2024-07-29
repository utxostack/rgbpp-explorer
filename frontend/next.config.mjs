/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
    esmExternals: true,
    gzipSize: true,
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              dimensions: false,
              template(variables, { tpl }) {
                return tpl`
                ${variables.imports};
                import { styled } from 'styled-system/jsx';
                
                ${variables.interfaces};
                
                const ${variables.componentName} = styled((${variables.props}) => (
                  ${variables.jsx}
                ));
                
                ${variables.exports};`
              },
            },
          },
        ],
      },
    )
    fileLoaderRule.exclude = /\.svg$/i
    return config
  },
}

export default nextConfig
