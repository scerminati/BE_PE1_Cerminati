import express from "express"; 
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import viewsRouter from "./router/views.router.js";
import cartRouter from "./router/cart.router.js"
import productsRouter from "./router/products.router.js"


const app = express();
const PORT = 8080;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

//Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//Estáticos
app.use(express.static(__dirname + "/public"));


let messageLogs = [];

const httpServer = app.listen(PORT, () => {
    console.log(`Server runing on port ${PORT}`);
  });
  
  const socketServer = new Server(httpServer);
  
  socketServer.on("connection", (socket) => {
    console.log("New client connected");
  
    socket.on("message", (data) => {
      messageLogs.push(data);
      socket.emit("messageLogs", messageLogs);
    });
  });