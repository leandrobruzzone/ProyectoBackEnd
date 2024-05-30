import express from "express";
import cartRouter from "./src/routes/cart.router.js";
import productsRouter from "./src/routes/products.router.js";
import { __dirname } from "./src/path.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import viewsRouter from "./src/routes/views.routes.js";
import ProductsManager from "./src/managers/product.manager.js";

const productManager = new ProductsManager(`${__dirname}/db/products.json`);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);

app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use("/", viewsRouter);

const PORT = 8080;

const httpServer = app.listen(PORT, () =>
  console.log(`Escuchando en el puerto ${PORT}`)
);

const socketServer = new Server(httpServer);

socketServer.on("connection", async (socket) => {
  console.log(`Nuevo cliente conectado - client ID: ${socket.id}`);

  socket.emit("products", await productManager.getProducts());
  console.log("Productos enviados al cliente");

  socket.on("disconnect", () => console.log(`Cliente desconectado`));

  socket.on("newProduct", async (newProduct) => {
    await productManager.createProduct(newProduct);
    const products = await productManager.getProducts();
    socketServer.emit("products", products);
  });

  socket.on("deleteProduct", async (id) => {
    await productManager.deleteProduct(id);
    console.log("Producto eliminado");
    const products = await productManager.getProducts();
    socketServer.emit("products", products);
  });
});
