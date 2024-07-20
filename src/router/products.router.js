import express from "express";
import { fileManager, getNextId } from "../utils/filemanager.js";
import { socketServer } from "../app.js"; // Importar el servidor de Socket.io

const router = express.Router();

// Middleware para cargar los productos desde el archivo products.json al inicio
router.use(async (req, res, next) => {
  try {
    const loadedProducts = await fileManager("products", false, []);
    req.products = loadedProducts; // Guardar los productos en el objeto de solicitud
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los productos." });
  }
});

// Obtener todos los productos
router.get("/", (req, res) => {
  const { products } = req; // Obtener productos del objeto de solicitud
  let limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    let productosLimitados = [...products];
    productosLimitados = productosLimitados.slice(0, limit);
    res.status(200).json({
      msg: `Mostrando los primeros ${limit} productos`,
      productosLimitados,
    });
  } else {
    res.status(200).json({ msg: "Mostrando todos los productos", products });
  }
});

// Obtener producto por ID
router.get("/:pid", (req, res) => {
  const { products } = req;
  let idProducto = parseInt(req.params.pid);
  const productoEncontrado = products.find(
    (producto) => producto.id === idProducto
  );
  productoEncontrado
    ? res.status(200).json({
        msg: `Mostrando el producto con id ${idProducto}`,
        productoEncontrado,
      })
    : res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
});

// Agregar un nuevo producto
router.post("/", (req, res) => {
  const { products } = req;
  const { title, description, code, price, stock, category, thumbnail } =
    req.body;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof code !== "number" ||
    typeof price !== "number" ||
    typeof stock !== "number" ||
    typeof category !== "string"
  ) {
    return res.status(400).json({
      msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
    });
  }

  let status = stock > 0;

  const newProduct = {
    id: getNextId(products),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnail: thumbnail || "",
  };

  products.push(newProduct);
  fileManager("products", true, products)
    .then(() => {
      // Emitir evento de actualización de producto
      socketServer.emit("Product Update", newProduct);
      res.status(201).json({
        msg: `Producto agregado exitosamente con id ${newProduct.id}`,
        newProduct,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ msg: "Error al guardar el producto." });
    });
});

// Modificar un producto por ID
router.put("/:pid", (req, res) => {
  const { products } = req;
  let idProducto = parseInt(req.params.pid);
  const index = products.findIndex((producto) => producto.id === idProducto);

  if (index === -1) {
    return res
      .status(404)
      .json({ msg: "No se encuentra el producto con dicho id" });
  }

  const { title, description, code, price, stock, category, thumbnail } =
    req.body;

  if (
    (title !== undefined && typeof title !== "string") ||
    (description !== undefined && typeof description !== "string") ||
    (code !== undefined && typeof code !== "number") ||
    (price !== undefined && typeof price !== "number") ||
    (stock !== undefined && typeof stock !== "number") ||
    (category !== undefined && typeof category !== "string")
  ) {
    return res.status(400).json({
      msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
    });
  } else {
    products[index] = {
      ...products[index],
      title: title || products[index].title,
      description: description || products[index].description,
      code: code || products[index].code,
      price: price || products[index].price,
      stock: stock !== undefined ? stock : products[index].stock,
      status: stock > 0,
      category: category || products[index].category,
      thumbnail: thumbnail || products[index].thumbnail,
    };

    fileManager("products", true, products)
      .then(() => {
        // Emitir evento de actualización de producto
        socketServer.emit("Product Update", products[index]);
        res.status(200).json({
          msg: `Producto modificado correctamente en el id ${idProducto}`,
          productoModificado: products[index],
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ msg: "Error al modificar el producto." });
      });
  }
});

// Eliminar un producto por ID
router.delete("/:pid", (req, res) => {
  const { products } = req;
  let idProducto = parseInt(req.params.pid);
  const index = products.findIndex((producto) => producto.id === idProducto);

  if (index === -1) {
    return res
      .status(404)
      .json({ msg: "No se encuentra el producto con dicho id" });
  }

  const productoAEliminar = products[index];
  products.splice(index, 1);

  fileManager("products", true, products)
    .then(() => {
      // Emitir evento de eliminación de producto
      socketServer.emit("Product Deleted", productoAEliminar);
      res.status(200).json({
        msg: `Se elimina el producto con id ${idProducto}`,
        productoAEliminar,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ msg: "Error al eliminar el producto." });
    });
});

export default router;
