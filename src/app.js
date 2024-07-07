const express = require("express");

const cartRouter = require("./router/cart.router.js");
const productsRouter = require("./router/products.router.js");
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
