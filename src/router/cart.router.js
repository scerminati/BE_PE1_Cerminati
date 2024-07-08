const express = require("express");
const fs = require("fs");
const router = express.Router();

let carts = [];

try {
  carts = JSON.parse(fs.readFileSync("./json/carts.json"), "utf8"); //utf8 es la encriptacion
} catch (error) {
  console.log(error, "No se pudo leer el archivo, se debe crear uno nuevo.");
  try {
    fs.writeFileSync("./json/carts.json", JSON.stringify(carts));
    console.log("Archivo creado correctamente");
  } catch (error) {
    console.log(error, "Error al crear archivo");
  }
}

console.log(
  `Archivo carts.json cargado correctamente, cantidad de carritos ${carts.length}`
);

router.get("/", (req, res) => {
  let limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    let carritosLimitados = [...carts];
    carritosLimitados = carritosLimitados.slice(0, limit);
    res.status(201).json({msg: `Mostrando ${limit} carritos`, carritosLimitados});
  } else {
    res.status(201).json({msg: "Mostrando todos los carritos", carts});
  }
});

//Se especifica mostrar carrito por id correspondiente
router.get("/:cid", (req, res) => {
  let idCarrito = parseInt(req.params.cid);
  const carritoEncontrado = carts.find((cart) => cart.id === idCarrito);
  carritoEncontrado
    ? res.status(201).json({msg: `Mostrando carrito con id ${idCarrito}`,carritoEncontrado})
    : res.status(404).json({ msg: "No se encuentra el carrito con dicho id" });
});

router.post("/", (req, res) => {
  const id = getNextId(carts);
  carts.push({ id, products: [] });
  escribirArchivo(carts);
  res
    .status(201)
    .json({ msg: `Nuevo carrito creado exitosamente con el id ${id}` });
});

router.put("/:cid/product/:pid", (req, res) => {
  let products = JSON.parse(fs.readFileSync("./json/products.json"), "utf8"); //utf8 es la encriptacion

  let idCarrito = parseInt(req.params.cid);
  let idProducto = parseInt(req.params.pid);

  const carritoEncontrado = carts.find((carrito) => carrito.id === idCarrito);
  if (carritoEncontrado) {
    const productoAAgregar = products.find(
      (product) => product.id === idProducto
    );

    if (productoAAgregar) {
      const index = carts.findIndex((carrito) => carrito.id === idCarrito);
      let productoCartIndex = carts[index].products.findIndex(
        (product) => product.id === idProducto
      );
      const indexP = products.findIndex((product) => product.id === idProducto);
      let existe = true;
      if (productoCartIndex != -1 && productoAAgregar.status) {
        carts[index].products[productoCartIndex].quantity++;
        products[indexP].stock--;
        products[indexP].stock === 0 && (products[indexP].status = false);
        escribirStock(products);
      } else if (!productoAAgregar.status) {
        existe = false;
        res.status(404).json({ msg: "No hay más stock de este producto" });
      } else {
        carts[index].products.push({
          id: productoAAgregar.id,
          quantity: 1,
        });
        products[indexP].stock--;
        products[indexP].stock === 0 && (products[indexP].status = false);
        escribirStock(products);
        productoCartIndex = carts[index].products.findIndex(
          (product) => product.id === idProducto
        );
      }
      if (existe) {
        escribirArchivo(carts);
        const objetoCart = carts[index];
        res.status(202).json({
          msg: `El producto ${idProducto} ha sido agregado correctamente al carrito ${idCarrito}, la cantidad actual es ${carts[index].products[productoCartIndex].quantity}`,
          objetoCart,
        });
      }
    } else {
      res.status(404).json({
        msg: `El producto con id ${idProducto} no existe y no puede agregarse al carrito con id ${idCarrito}.`,
      });
    }
  } else {
    res.status(404).json({ msg: `El carrito con id ${idCarrito} no existe.` });
  }
});

module.exports = router;

function getNextId(carts) {
  if (carts.length === 0) {
    return 1;
  } else {
    const largo = carts.length;
    const ultimoId = Math.max(...carts.map((cart) => cart.id));
    const maxId = largo >= ultimoId ? largo : ultimoId;

    return maxId + 1;
  }
}

function escribirArchivo(carts) {
  fs.writeFileSync("./json/carts.json", JSON.stringify(carts, null, 2));
}

function escribirStock(products) {
  fs.writeFileSync("./json/products.json", JSON.stringify(products, null, 2));
}
