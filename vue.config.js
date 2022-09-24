const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    css: {
        extract: false
    },
    configureWebpack: {
        optimization: {
            splitChunks: false
        }
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => ({
                ...options,
                compilerOptions: {
                    // treat any tag that starts with ion- as custom elements
                    isCustomElement: tag => [ "math-field" ].includes(tag)
                }
            }))
    }
});
