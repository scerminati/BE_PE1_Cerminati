const socket = io(); // Conectar al servidor de Socket.io

// Escuchar evento de actualización de producto
socket.on("connection", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("productUpdated", (updatedProduct) => {
  console.log("Producto actualizado:", updatedProduct);

  // Actualizar la lista de productos en la interfaz
  const productList = document.querySelector("ul");
  const existingProduct = productList.querySelector(
    `li[data-product-id="${updatedProduct.id}"]`
  );

  if (existingProduct) {
    // Si el producto ya existe en la lista, actualizar sus detalles
    existingProduct.innerHTML = `
       <p>Producto: ${updatedProduct.title} - Precio: $${updatedProduct.price} - Stock: ${updatedProduct.stock} </p>
     `;
  } else {
    // Si es un nuevo producto, agregarlo a la lista
    const newProductItem = document.createElement("li");
    newProductItem.setAttribute("data-product-id", updatedProduct.id);
    newProductItem.innerHTML = `
       <p>Producto: ${updatedProduct.title} - Precio: $${updatedProduct.price} - Stock: ${updatedProduct.stock} </p>
     `;
    productList.appendChild(newProductItem);
  }
});
