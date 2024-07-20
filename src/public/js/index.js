const socket = io(); // Conectar al servidor de Socket.io

// Escuchar evento de actualización de producto
socket.on("connection", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

const productList = document.getElementById("listado");

socket.on("Product Update", (updatedProduct) => {
  console.log("Producto Actualizado:", updatedProduct);

  // Actualizar la lista de productos en la interfaz

  const existingProduct = document.getElementById(updatedProduct.id);

  if (existingProduct) {
    // Si el producto ya existe en la lista, actualizar sus detalles
    existingProduct.innerHTML = `
       <p>Producto:
          ${updatedProduct.title}
          - Precio: $${updatedProduct.price}
          - Stock:
          ${updatedProduct.stock}
        </p>
     `;
  } else {
    // Si es un nuevo producto, agregarlo a la lista
    const newProductItem = document.createElement("div");
    newProductItem.setAttribute("id", updatedProduct.id);
    newProductItem.innerHTML = `
       <p>Producto:
          ${updatedProduct.title}
          - Precio: $${updatedProduct.price}
          - Stock:
          ${updatedProduct.stock}
        </p>
     `;
    productList.appendChild(newProductItem);
  }
});

socket.on("Product Deleted", (deletedProduct) => {
    console.log("Producto Eliminado:", deletedProduct);
  
    // Actualizar la lista de productos en la interfaz
    const existingProduct = document.getElementById(deletedProduct.id);
  
    existingProduct.remove()
  });
  