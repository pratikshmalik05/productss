const fs = require("fs/promises");
const path = require("path");

const DB_FILE = path.join(__dirname, "db.json");

async function readDb() {
  const raw = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeDb(data) {
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DB_FILE);
}

let queue = Promise.resolve();
function withLock(fn) {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
}

async function findAll() {
  const db = await readDb();
  return db.products;
}

async function findById(id) {
  const db = await readDb();
  return db.products.find((p) => p.id === id) || null;
}

async function insert(data) {
  return withLock(async () => {
    const db = await readDb();
    const product = { id: db.lastId + 1, ...data };
    db.lastId = product.id;
    db.products.push(product);
    await writeDb(db);
    return product;
  });
}

async function replace(id, data) {
  return withLock(async () => {
    const db = await readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.products[index] = { id, ...data };
    await writeDb(db);
    return db.products[index];
  });
}

async function update(id, data) {
  return withLock(async () => {
    const db = await readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.products[index] = { ...db.products[index], ...data, id };
    await writeDb(db);
    return db.products[index];
  });
}

async function remove(id) {
  return withLock(async () => {
    const db = await readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    await writeDb(db);
    return true;
  });
}

module.exports = { findAll, findById, insert, replace, update, remove };
