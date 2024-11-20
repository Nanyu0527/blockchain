// const path = require('path');

// module.exports = {
//   mode: 'development',
//   entry: './src/index.js', // 入口文件
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'dist'),
//   },
//   module: {
//     rules: [
//       {
//         test: /\.jsx?$/, // 匹配 .js 和 .jsx 文件
//         exclude: /node_modules/, // 排除 node_modules 目录
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env', '@babel/preset-react'], // 使用 babel 预设
//           },
//         },
//       },
//     ],
//   },
//   devServer: {
//     static: {
//       directory: path.join(__dirname, 'public'), // 静态资源目录
//     },
//     compress: true,
//     port: 9000,
//   },
// };
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js', // 入口文件改为 index.js
  output: {
    filename: 'App.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // 匹配 .js 和 .jsx 文件
        exclude: /node_modules/, // 排除 node_modules 目录
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // 使用 babel 预设
          },
        },
      },
    ],
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'public'), // 静态资源目录
      },
      {
        directory: path.join(__dirname, 'dist'), // 添加 dist 目录
      },
    ],
    compress: true,
    port: 3000,
  },
};