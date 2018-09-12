// 本来准备使用axios的，后来发现一个超好用的http模块SuperAgent, 把链式调用玩出花来了，决定尝尝鲜
// 这里统一采用es6的模块写法，通过webpack兼容浏览器和Node两端
import http from "superagent";
import { promisify } from "./util";

const BASE = "http://rnpm.hz.netease.com";

class npmAPI {
  constructor(config) {
    this.createModule();
  }
  createModule() {
    // 一些公用的API
    this.key = promisify((key, cb) => {
      // let nKey = key.replace(//)
      this.request(`/${key}`, "get", {}, cb);
    });
  }

  // 统一封装一个内部使用的通用的查询，封装一些通用的属性
  request(api, method, opt, cb) {
    switch (method.toLowerCase()) {
      case "get":
        // SuperAgent灵活的链式写法，使得代码可以很清晰
        http
          .get(BASE + api)
          .set("Accept", "application/json")
          .ok(res => res.status < 600)
          // superagent已经把所有的错误都封装了，因此我这里没有单独对错误做处理，需要自己根据res.status做错误处理
          // 返回的结果不管是正确还是错误都是{code,data}的形式
          .then(res => {
            let data = "";
            if (res.status === 200) {
              switch (res.type) {
                case "text/plain":
                  data = res.text;
                  break;
                // 自动转成json格式
                case "application/json":
                  data = res.body;
                  break;
              }
            } else {
              data = res.error;
            }
            cb(null, {
              code: res.status,
              data
            });
          });
        break;
    }
  }
}

export default new npmAPI();
