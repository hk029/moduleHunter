# moduleHunter

这是一个模块依赖分析小工具，自带 CLI 工具，可以分析本地的某个目录或线上的某个包的依赖关系

## CLI 安装方案

```javascript
npm install -g moduleHunter
```

## CLI 使用方法

```javascript
mh -d ./    //可以查看本地工程目录的依赖情况
mh -m chalk //可以查看线上某个模块的依赖情况
```

会出现如下输出

```
✔ ──chalk ^2.4.1-->2.4.1
  ├──ansi-styles ^3.2.1
  ├──escape-string-regexp ^1.0.5
  ├──supports-color ^5.3.0

✔ ──ansi-styles ^3.2.1-->3.2.1
  ├──color-convert ^1.9.0

⠴ 正在寻找依赖：color-convert ^1.9.0^C
```

最后会生成完成的依赖关系:

```
──chalk 2.4.1
  ├──ansi-styles 3.2.1
  │    ├──color-convert 1.9.3
  │    │    ├──color-name 1.1.3
  ├──escape-string-regexp 1.0.5
  ├──supports-color 5.5.0
  │    ├──has-flag 3.0.0
──commander 2.18.0
──loadash 1.0.0
──ora 3.0.0
  ├──chalk 2.4.1
  ├──cli-cursor 2.1.0
  │    ├──restore-cursor 2.0.0
  │    │    ├──onetime 2.0.1
  │    │    │    ├──mimic-fn 1.2.0
  │    │    ├──signal-exit 3.0.2
  ├──cli-spinners 1.3.1
  ├──log-symbols 2.2.0
  │    ├──chalk 2.4.1
  ├──strip-ansi 4.0.0
  │    ├──ansi-regex 3.0.0
  ├──wcwidth 1.0.1
  │    ├──defaults 1.0.3
  │    │    ├──clone 1.0.4
──semver 5.5.1
──superagent 3.8.3
  ├──component-emitter 1.2.1
  ├──cookiejar 2.1.2
  ├──debug 3.2.5
  │    ├──ms 2.1.1
  ├──extend 3.0.2
  ├──form-data 2.3.2
  │    ├──asynckit 0.4.0
  │    ├──combined-stream 1.0.6
  │    │    ├──delayed-stream 1.0.0
  │    ├──mime-types 2.1.20
  │    │    ├──mime-db 1.36.0
  ├──formidable 1.2.1
  ├──methods 1.1.2
```

## 工程版

### 安装方法

```javascript
npm install modulehunter
```

### 使用方法

```javascript
const mh = require("./index");
const { getPack, getAllDep, outputPack } = mh;
const { log } = console;
/**
 * Promise Then调用方式
 */

// 不加版本参数，默认是latest
getPack("koa").then(pack => log(pack));

// 不加版本参数，默认是latest
getPack("koa", "1.0.0").then(pack => log(pack));

// getAllDep会返回一个包的信息，其中dependencies信息会被换成嵌套的依赖信息
getAllDep("file", "./").then(pack => outputPack(pack));
getAllDep("mod", "koa").then(pack => outputPack(pack));

// 最后一个参数是扁平化输出，如果设置为true，会把依赖关系扁平化
getAllDep("mod", "koa", true).then(pack => log(pack));

/**
 * Async await 调用方式
 */
(async () => {
  log(await getPack("koa"));
  outputPack(getAllDep("file", "./"));
})();
```

### API

#### getPack( packName, version = 'latest', returnVal )

获取某个版本的 NPM 包信息，默认返回以下字段：

- "name"
- "version"
- "keywords"
- "repository"
- "description"
- "homepage"
- "dependencies"

可以通过设置 returnVal 选择需要的字段

```
getPack("modulehunter", 'latest', ['name', 'version']).then(val => log(val));
```

#### getAllDep(type, data, plain = false)

获取一个包的所有依赖关系。

- type : 'dir' / 'mod'
- data : 对应的文件夹名或线上包名
- plain: 是否扁平化

生成的包的`dependencies` 会被替换成如下形式：

```json
{
	……
      "chalk2.4.1":{
        "version": "2.4.1",
        "inVersion": "^2.4.1",
        "dependencies": {
          "ansi-styles": {
            "version": "3.2.1",
            "inVersion": "^3.2.1",
            "dependencies": {
              "color-convert": {
                "version": "1.9.3",
                "inVersion": "^1.9.0",
                "dependencies": {
                  "color-name": {
                    "version": "1.1.3",
                    "inVersion": "1.1.3",
                    "dependencies": {}
                  }
                }
              }
            }
          },
      ……
```

扁平化后输出:

```json
"dependencies": {
    "chalk": { "version": "2.4.1", "path": ["chalk 2.4.1"] },
    "ansi-styles": {
      "version": "3.2.1",
      "path": ["chalk 2.4.1", "ansi-styles 3.2.1"]
    },
    "color-convert": {
      "version": "1.9.3",
      "path": ["chalk 2.4.1", "ansi-styles 3.2.1", "color-convert 1.9.3"]
    },
    "color-name": {
      "version": "1.1.3",
      "path": [
        "chalk 2.4.1",
        "ansi-styles 3.2.1",
        "color-convert 1.9.3",
        "color-name 1.1.3"
      ]
    },
    "escape-string-regexp": {
      "version": "1.0.5",
      "path": ["chalk 2.4.1", "escape-string-regexp 1.0.5"]
    },
    "supports-color": {
      "version": "5.5.0",
      "path": ["chalk 2.4.1", "supports-color 5.5.0"]
    },
    ……
```

#### outputPack(pack)

> 与 getAllDep 配合使用

以格式化的形式输出`未扁平化`模块的依赖关系，如：

![20180917153718726060394.png](http://o7bk1ffzo.bkt.clouddn.com/20180917153718726060394.png)

### 版本信息

1.1.1:

- `getAllDep` 增加了扁平化`plain`选项。

1.1.0:

- 增加了缓存，考虑部分模块循环依赖，还有大量公用模块的隐私，引入缓存能极大的提升查询效率。（缓存借鉴了[zensh](https://gist.github.com/zensh/5069881))
- 修改了显示文字，更加凸显最终结果

1.0.1:

- 修改了目录结构

1.0.0:

- 利用 npm 的接口，递归获取所有的依赖数据
- 提供了 CLI 工具，方便查看目录和 NPM 线上模块
