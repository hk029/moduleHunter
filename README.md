# moduleHunter

这是一个模块依赖分析小工具，自带CLI工具，可以分析本地的某个目录或线上的某个包的依赖关系

## CLI安装方案

```javascript
npm install -g moduleHunter
```


## CLI使用方法

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
  ├──mime 1.6.0
  ├──qs 6.5.2
  ├──readable-stream 2.3.6
  │    ├──core-util-is 1.0.2
  │    ├──inherits 2.0.3
  │    ├──isarray 1.0.0
  │    ├──process-nextick-args 2.0.0
  │    ├──safe-buffer 5.1.2
  │    ├──string_decoder 1.1.1
  │    │    ├──safe-buffer 5.1.2
  │    ├──util-deprecate 1.0.2
```
