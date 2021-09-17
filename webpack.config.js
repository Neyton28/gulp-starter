config = require('./config.js')

module.exports = {
    entry: `./${config.folders.src}/js/${config.webpack.entryFileName}`,
    mode: config.mode,
    output: {
        filename: config.webpack.outputFileName,
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            exclude: ["transform-regenerator"]
                        },
                    ]
                ],
              }
            }
          }
        ]
      }
}
