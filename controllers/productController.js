
const productService = require("../services/productService");

const isValidBody = (b) =>
  b && typeof b.name === "string" && b.name.trim() !== "" &&
  typeof b.price === "number" && b.price >= 0;

const isValidPatch = (b) =>
  b && (b.name !== undefined || b.price !== undefined) &&
  (b.name === undefined || (typeof b.name === "string" && b.name.trim() !== "")) &&
  (b.price === undefined || (typeof b.price === "number" && b.price >= 0));

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return null;
  }
  return id;
}

async function getAll(req, res, next) {
  try {
    res.json(await productService.getAllProducts());
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!isValidBody(req.body)) {
      return res.status(400).json({ error: "name (string) and price (number >= 0) are required" });
    }
    res.status(201).json(await productService.createProduct(req.body));
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    if (!isValidBody(req.body)) {
      return res.status(400).json({ error: "name (string) and price (number >= 0) are required" });
    }
    const product = await productService.replaceProduct(id, req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    if (!isValidPatch(req.body)) {
      return res.status(400).json({ error: "Provide a valid name and/or price" });
    }
    const product = await productService.updateProduct(id, req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const deleted = await productService.deleteProduct(id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, replace, update, remove };
