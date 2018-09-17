/**
 * 修改自zensh写的一个缓存，用Buffer来提高效率
 * @source git https://gist.github.com/zensh/5069881
 */
const fs = require("fs");
const path = require("path");
const pack = require("../package.json");
// 更新链表，把get或put方法操作的key提到链表head，即表示最新
function refresh(linkedList, entry) {
  if (entry != linkedList.head) {
    if (!linkedList.end) {
      linkedList.end = entry;
    } else if (linkedList.end == entry) {
      linkedList.end = entry.n;
    }
    link(entry.n, entry.p);
    link(entry, linkedList.head);
    linkedList.head = entry;
    linkedList.head.n = null;
  }
}

// 对两个链表对象建立链接，形成一条链
function link(nextEntry, prevEntry) {
  if (nextEntry != prevEntry) {
    if (nextEntry) nextEntry.p = prevEntry;
    if (prevEntry) prevEntry.n = nextEntry;
  }
}

class LRUCache {
  constructor(config = {}) {
    const { capacity, file } = config;
    this.capacity = capacity || Number.MAX_VALUE;
    this.cacheFile = file || "./cacheDB";
    this.cacheFile = path.resolve(__dirname, this.cacheFile);
    this.data = {};
    this.hash = {};
    this.linkedList = {
      length: 0,
      head: null,
      end: null
    };
    if (capacity <= 0) this.capacity = Number.MAX_VALUE;
    this.loadCache();
  }

  loadCache() {
    if (fs.existsSync(this.cacheFile)) {
      let tmp = JSON.parse(fs.readFileSync(this.cacheFile).toString());
      // 如果版本号一致则读取文件
      if (tmp.version === pack.version) {
        tmp.data.map(val => {
          const { key, value } = val;
          this.put(key, value);
        });
      }
    }
  }

  get(key) {
    key = "_" + key;
    var lruEntry = this.hash[key];
    if (!lruEntry) return;
    refresh(this.linkedList, lruEntry);
    return JSON.parse(this.data[key].toString());
  }

  put(key, value) {
    key = "_" + key;
    var lruEntry = this.hash[key];
    if (value === undefined) return this;
    if (!lruEntry) {
      this.hash[key] = { key: key };
      this.linkedList.length += 1;
      lruEntry = this.hash[key];
    }
    refresh(this.linkedList, lruEntry);
    this.data[key] = new Buffer(JSON.stringify(value));
    if (this.linkedList.length > this.capacity)
      this.remove(this.linkedList.end.key.slice(1));
    return this;
  }

  remove(key) {
    key = "_" + key;
    var lruEntry = this.hash[key];
    if (!lruEntry) return this;
    if (lruEntry === this.linkedList.head) this.linkedList.head = lruEntry.p;
    if (lruEntry === this.linkedList.end) this.linkedList.end = lruEntry.n;
    link(lruEntry.n, lruEntry.p);
    delete this.hash[key];
    delete this.data[key];
    this.linkedList.length -= 1;
    return this;
  }

  removeAll() {
    this.data = {};
    this.hash = {};
    this.linkedList = {
      length: 0,
      head: null,
      end: null
    };
    return this;
  }

  info() {
    var size = 0,
      data = this.linkedList.head;
    while (data) {
      size += this.data[data.key].length;
      data = data.p;
    }
    return {
      capacity: this.capacity,
      length: this.linkedList.length,
      size: size
    };
  }

  persistence() {
    let obj = { version: pack.version };
    let data = Object.keys(this.data).map(tkey => {
      let key = tkey.slice(1);
      return {
        key,
        value: this.get(key)
      };
    });
    obj.data = data;
    if (this.cacheFile) {
      fs.writeFileSync(this.cacheFile, JSON.stringify(obj));
    }
  }
}

module.exports = LRUCache;
