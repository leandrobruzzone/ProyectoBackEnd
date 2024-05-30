import { Router } from "express";
const router = Router();

import { __dirname } from "../path.js";

import ProductManager from "../managers/product.manager.js";
const productManager = new ProductManager(`${__dirname}/db/products.json`);

import { productValidator } from "../middlewares/productValidator.js";

router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    console.log(limit);
    const products = await productManager.getProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(404).json({ message: error.message });
    console.log(error);
  }
});

router.get("/:idProd", async (req, res) => {
  try {
    const { idProd } = req.params;
    const product = await productManager.getProductById(idProd);
    if (!product) res.status(404).json({ msg: "Producto no encontrado" });
    else res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/", productValidator, async (req, res) => {
  try {
    console.log(req.body);
    const product = req.body;
    const newProduct = await productManager.createProduct(product);
    res.json(newProduct);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.put("/:idProd", async (req, res) => {
  try {
    const { idProd } = req.params;
    const prodUpd = await productManager.updateProduct(req.body, idProd);
    if (!prodUpd)
      res.status(404).json({ msg: "Error en la carga del producto" });
    res.status(200).json(prodUpd);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/:idProd", async (req, res) => {
  try {
    const { idProd } = req.params;
    const delProd = await productManager.deleteProduct(idProd);
    if (!delProd)
      res.status(404).json({ msg: "Error al intentar eliminar el producto" });
    else
      res
        .status(200)
        .json({ msg: `Producto id: ${idProd} Eliminado con éxito` });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await productManager.deleteFile();
    res.send("Producto eliminado con éxito.");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
