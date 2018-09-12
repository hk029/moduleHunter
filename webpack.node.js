const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/moduleHunter.js")
  },
  node: {
    __filename: true,
    __dirname: true
  },
  mode: "development",
  target: "node",
  // module: {
  //   // 如何处理项目中不同类型的模块
  //   rules: [
  //     // 用于规定在不同模块被创建时如何处理模块的规则数组
  //     {
  //       test: /(\.jsx|\.js)$/,
  //       use: {
  //         loader: "babel-loader",
  //         options: {
  //           presets: ["latest"] //按照最新的ES6语法规则去转换
  //         }
  //       },
  //       exclude: /node_modules/,
  //       //编译时，不需要编译哪些文件
  //       include: path.resolve(__dirname, "src")
  //       //在config中查看 编译时，需要包含哪些文件*/
  //     }
  //   ]
  // },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./"),
    library: "index",
    libraryTarget: "umd"
  },
  externals: [
    {
      formidable: "commonjs formidable"
    }
  ]
};
