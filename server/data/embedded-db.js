const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'store.json');

class Collection {
  constructor(name, getStore, saveStore) {
    this.name = name;
    this.getStore = getStore;
    this.saveStore = saveStore;
  }

  _getItems() {
    const store = this.getStore();
    if (!store[this.name]) {
      store[this.name] = [];
    }
    return store[this.name];
  }

  find(query = {}) {
    let items = this._getItems();
    let filtered = items.filter(item => this._matches(item, query));

    const resultWrapper = {
      _data: filtered,
      sort(sortObj) {
        if (!sortObj) return this;
        const [field, dir] = Object.entries(sortObj)[0] || [];
        if (field) {
          this._data.sort((a, b) => {
            const valA = a[field] ?? '';
            const valB = b[field] ?? '';
            if (valA < valB) return dir === -1 || dir === 'desc' ? 1 : -1;
            if (valA > valB) return dir === -1 || dir === 'desc' ? -1 : 1;
            return 0;
          });
        }
        return this;
      },
      skip(count) {
        if (count > 0) this._data = this._data.slice(count);
        return this;
      },
      limit(count) {
        if (count > 0) this._data = this._data.slice(0, count);
        return this;
      },
      select(fields) {
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(this._data).then(resolve, reject);
      }
    };

    return resultWrapper;
  }

  async findOne(query = {}) {
    const items = this._getItems();
    const item = items.find(i => this._matches(i, query));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async findById(id) {
    const items = this._getItems();
    const item = items.find(i => String(i._id) === String(id) || String(i.id) === String(id));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(data) {
    const store = this.getStore();
    if (!store[this.name]) store[this.name] = [];

    const newItem = {
      _id: data._id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    store[this.name].push(newItem);
    this.saveStore();
    return JSON.parse(JSON.stringify(newItem));
  }

  async insertMany(arr) {
    const store = this.getStore();
    if (!store[this.name]) store[this.name] = [];
    const created = [];
    for (const data of arr) {
      const newItem = {
        _id: data._id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      };
      store[this.name].push(newItem);
      created.push(newItem);
    }
    this.saveStore();
    return created;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const store = this.getStore();
    const items = store[this.name] || [];
    const index = items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) return null;

    let updateData = update.$set ? { ...items[index], ...update.$set } : { ...items[index], ...update };
    if (update.$inc) {
      for (const [key, incVal] of Object.entries(update.$inc)) {
        updateData[key] = (Number(updateData[key]) || 0) + incVal;
      }
    }
    if (update.$addToSet) {
      for (const [key, val] of Object.entries(update.$addToSet)) {
        const arr = Array.isArray(updateData[key]) ? [...updateData[key]] : [];
        if (!arr.includes(val)) arr.push(val);
        updateData[key] = arr;
      }
    }
    if (update.$pull) {
      for (const [key, val] of Object.entries(update.$pull)) {
        if (Array.isArray(updateData[key])) {
          updateData[key] = updateData[key].filter(x => x !== val && x?._id !== val);
        }
      }
    }

    updateData.updatedAt = new Date().toISOString();
    store[this.name][index] = updateData;
    this.saveStore();
    return JSON.parse(JSON.stringify(updateData));
  }

  async findByIdAndDelete(id) {
    const store = this.getStore();
    const items = store[this.name] || [];
    const index = items.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    this.saveStore();
    return removed;
  }

  async countDocuments(query = {}) {
    const items = this._getItems();
    return items.filter(item => this._matches(item, query)).length;
  }

  async distinct(field) {
    const items = this._getItems();
    const set = new Set();
    items.forEach(i => {
      if (i[field] !== undefined && i[field] !== null) set.add(i[field]);
    });
    return Array.from(set);
  }

  _matches(item, query) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '$or') {
        const anyMatch = val.some(subQuery => this._matches(item, subQuery));
        if (!anyMatch) return false;
        continue;
      }

      const itemVal = item[key];
      if (val instanceof RegExp) {
        if (!val.test(String(itemVal || ''))) return false;
      } else if (typeof val === 'object' && val !== null) {
        if (val.$regex) {
          const re = new RegExp(val.$regex, val.$options || 'i');
          if (!re.test(String(itemVal || ''))) return false;
        } else if (val.$in) {
          if (!val.$in.includes(itemVal)) return false;
        } else if (val.$ne !== undefined) {
          if (itemVal === val.$ne) return false;
        } else if (val.$gte !== undefined) {
          if (!(Number(itemVal) >= Number(val.$gte))) return false;
        }
      } else {
        if (itemVal != val) return false;
      }
    }
    return true;
  }
}

class EmbeddedDatabase {
  constructor() {
    this.store = {
      users: [],
      books: [],
      categories: [],
      suggestions: [],
      auditLogs: []
    };
    this.initialized = false;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.store = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[EmbeddedDB] Failed to load store file, starting fresh', err.message);
    }
    this.initialized = true;
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('[EmbeddedDB] Failed to persist store to disk', err.message);
    }
  }

  collection(name) {
    return new Collection(name, () => this.store, () => this.save());
  }
}

const dbInstance = new EmbeddedDatabase();

module.exports = {
  dbInstance,
  User: dbInstance.collection('users'),
  Book: dbInstance.collection('books'),
  Category: dbInstance.collection('categories'),
  Suggestion: dbInstance.collection('suggestions'),
  AuditLog: dbInstance.collection('auditLogs')
};
