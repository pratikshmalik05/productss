const db = require("../database/db");

async function getAllProducts() {
  return db.findAll();
}

async function getProductById(id) {
  return db.findById(id);
}

async function createProduct(data) {
  return db.insert({ name: data.name, price: data.price });
}

async function replaceProduct(id, data) {
  return db.replace(id, { name: data.name, price: data.price });
}

async function updateProduct(id, data) {
  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name;
  if (data.price !== undefined) allowed.price = data.price;
  return db.update(id, allowed);
}

async function deleteProduct(id) {
  return db.remove(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
};
