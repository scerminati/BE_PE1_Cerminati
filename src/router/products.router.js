const express = require("express");
const fs = require("fs");
const router = express.Router();

let products = [];

//Iniciador de archivo products.json con array de productos, se utiliza solamente para generar el primer archivo, cargando el array en products.
/*try {
  fs.writeFileSync("./json/products.json", JSON.stringify(products, null, 2));
} catch (error) {
  console.log(error);
}*/

try {
  products = JSON.parse(fs.readFileSync("./json/products.json"), "utf8"); //utf8 es la encriptacion
} catch (error) {
  console.log(error, "No se pudo leer el archivo, se debe crear uno nuevo.");
  fs.writeFileSync("./json/products.json", JSON.stringify(products));
  console.log("Archivo creado correctamente");
}

console.log(
  `Archivo products.json cargado correctamente, cantidad de productos ${products.length}`
);

//Se realiza la petición GET, donde si se especifica el límite de queries, se realiza el display como tal, y sino, se muestran todos los productos.
router.get("/", (req, res) => {
  products = leerArchivo();
  let limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    let productosLimitados = [...products];
    productosLimitados = productosLimitados.slice(0, limit);
    res
      .status(201)
      .json({
        msg: `Mostrando los primeros ${limit} productos`,
        productosLimitados,
      });
  } else {
    res.status(201).json({ msg: "Mostrando todos los productos", products });
  }
});

//Se especifica el producto por id, con el método GET.
router.get("/:pid", (req, res) => {
  products = leerArchivo();
  let idProducto = parseInt(req.params.pid);
  const productoEncontrado = products.find(
    (producto) => producto.id === idProducto
  );
  productoEncontrado
    ? res
        .status(201)
        .json({
          msg: `Mostrando el producto con id ${idProducto}`,
          productoEncontrado,
        })
    : res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
});

//Se especifica el método post para agregar un nuevo producto
router.post("/", (req, res) => {
  products = leerArchivo();
  const { title } = req.body;
  const { description } = req.body;
  const { code } = req.body;
  const { price } = req.body;
  const { stock } = req.body;
  const { category } = req.body;
  let { thumbnail } = req.body;

  if (!thumbnail || typeof thumbnail !== "string") {
    thumbnail = "";
  }

  if (
    typeof title == "string" &&
    typeof description == "string" &&
    typeof code == "number" &&
    typeof price == "number" &&
    typeof stock == "number" &&
    typeof category == "string"
  ) {
    let status;
    if (stock > 0) {
      status = true;
    } else {
      status = false;
    }
    //armar nuevo id
    const newProduct = {
      id: getNextId(products),
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail,
    };

    products.push(newProduct);
    escribirArchivo(products);
    res.status(201).json({
      msg: `producto agregado exitosamente con id ${newProduct.id}`,
      newProduct,
    });
  } else {
    console.log(title, description, code, price, stock, category, thumbnail);
    res.status(404).json({
      msg: "Falta algún campo obligatorio o alguno de los campos tiene el tipo de dato incorrecto.",
    });
  }
});

//Se espefica el método put, tal que lo que se modifique, se cambie en el archivo.
router.put("/:pid", (req, res) => {
  products = leerArchivo();
  let idProducto = parseInt(req.params.pid);
  const index = products.findIndex((producto) => producto.id === idProducto);
  if (index === -1) {
    res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
  } else {
    const { title } = req.body;
    const { description } = req.body;
    const { code } = req.body;
    const { price } = req.body;
    const { stock } = req.body;
    const { category } = req.body;
    let { thumbnail } = req.body;

    const idModificado = products[index].id;
    typeof title == "string" && (products[index].title = title);
    typeof description == "string" &&
      (products[index].description = description);
    typeof code == "number" && (products[index].code = code);
    price && (products[index].price = price);
    typeof stock == "number" && (products[index].stock = stock);
    stock == 0
      ? (products[index].status = false)
      : (products[index].status = true);
    typeof category == "string" && (products[index].category = category);
    typeof thumbnail == "string" && (products[index].thumbnail = thumbnail);

    const productoModificado = products[index];
    escribirArchivo(products);
    res.status(201).json({
      msg: `producto modificado correctamente en el id ${idModificado}`,
      productoModificado,
    });
  }
});

//Se especifica el método delete
router.delete("/:pid", (req, res) => {
  products = leerArchivo();
  let idProducto = parseInt(req.params.pid);
  const productoAEliminar = products.find(
    (producto) => producto.id === idProducto
  );
  if (productoAEliminar) {
    products = products.filter((product) => product.id !== idProducto);
    escribirArchivo(products);
    res.status(201).json({
      msg: `Se elimina el producto con id ${productoAEliminar.id}`,
      productoAEliminar,
    });
  } else {
    res.status(404).json({ msg: "No se encuentra el producto con dicho id" });
  }
});

module.exports = router;

function getNextId(products) {
  if (products.length === 0) {
    return 1;
  } else {
    const largo = products.length;
    const ultimoId = Math.max(...products.map((producto) => producto.id));
    const maxId = largo >= ultimoId ? largo : ultimoId;

    return maxId + 1;
  }
}

function escribirArchivo(products) {
  fs.writeFileSync("./json/products.json", JSON.stringify(products, null, 2));
}

function leerArchivo() {
  return JSON.parse(fs.readFileSync("./json/products.json"), "utf8");
}
