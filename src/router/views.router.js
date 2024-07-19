import express from "express";
const router = express.Router();

function leerArchivo() {
  return JSON.parse(fs.readFileSync("./json/products.json"), "utf8");
}

router.get("/", (req, res) => {
  let products = leerArchivo();

  res.render("index", products);
});

export default router;
