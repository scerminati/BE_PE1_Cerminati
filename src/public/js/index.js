// Conectar al servidor de Socket.io
const socket = io();

// Escuchar eventos de conexión y desconexión
socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const productList = document.getElementById("listado");
  const productForm = document.getElementById("productForm");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const codeInput = document.getElementById("code");
  const priceInput = document.getElementById("price");
  const stockInput = document.getElementById("stock");
  const categoryInput = document.getElementById("category");
  const thumbnailInput = document.getElementById("thumbnail");
  const thumbnailPreview = document.getElementById("thumbnailPreview");
  const productIdInput = document.getElementById("productId");
  const submitBtn = document.getElementById("submitBtn");

  // Escuchar evento de actualización de producto
  socket.on("Product Update", (updatedProduct) => {
    console.log("Producto Actualizado:", updatedProduct);

    const existingProduct = document.getElementById(updatedProduct.id);

    if (existingProduct) {
      // Actualizar detalles del producto en la lista
      existingProduct.innerHTML = `
        <p>Producto: ${updatedProduct.title} - Precio: $${updatedProduct.price} - Stock: ${updatedProduct.stock}</p>
      `;
    } else {
      // Agregar nuevo producto a la lista
      const newProductItem = document.createElement("div");
      newProductItem.setAttribute("id", updatedProduct.id);
      newProductItem.innerHTML = `
        <p>Producto: ${updatedProduct.title} - Precio: $${updatedProduct.price} - Stock: ${updatedProduct.stock}
          <button type="button" class="btn-modify" data-product-id="${updatedProduct.id}">Modificar</button>
          <button type="button" class="btn-delete" data-product-id="${updatedProduct.id}">Eliminar</button>
        </p>
      `;
      productList.appendChild(newProductItem);
    }
  });

  // Escuchar evento de eliminación de producto
  socket.on("Product Deleted", (deletedProduct) => {
    console.log("Producto Eliminado:", deletedProduct);

    const existingProduct = document.getElementById(deletedProduct.id);
    if (existingProduct) {
      existingProduct.remove();
    }
  });

  // Evento para enviar el formulario de producto
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("entro en post");

    const formData = new FormData(productForm);
    const title = formData.get("title");
    const description = formData.get("description");
    const code = parseInt(formData.get("code"));
    const price = parseFloat(formData.get("price"));
    const stock = parseInt(formData.get("stock"));
    const category = formData.get("category");
    let thumbnail = formData.get("thumbnail").name;

    if (thumbnail === null || thumbnail === undefined || thumbnail === "") {
      thumbnail = ""; // Asignar una cadena vacía si thumbnail es vacío
    } else {
      thumbnail = `../images/${thumbnail}`;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          code,
          price,
          stock,
          category,
          thumbnail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newProduct = await response.json();

      // Emitir evento de actualización de producto a través de Socket.io
      socket.emit("Product Update", newProduct.newProduct);

      // Resetear el formulario
      productForm.reset();
    } catch (error) {
      console.error("Error al agregar el producto:", error.message);
    }
  });

  // Evento para eliminar un producto
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-delete")) {
      const productId = event.target.getAttribute("data-product-id");

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const deletedProduct = await response.json();

        // Emitir evento de eliminación de producto a través de Socket.io
        socket.emit("Product Deleted", deletedProduct.productoAEliminar);
      } catch (error) {
        console.error("Error al eliminar el producto:", error.message);
      }
    }
  });

  // Evento para modificar un producto
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("btn-modify")) {
      const productId = event.target.getAttribute("data-product-id");

      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const productData = await response.json();

        // Mostrar los datos del producto en el formulario para editar
        titleInput.value = productData.productoEncontrado.title;
        descriptionInput.value = productData.productoEncontrado.description;
        codeInput.value = productData.productoEncontrado.code;
        priceInput.value = productData.productoEncontrado.price;
        stockInput.value = productData.productoEncontrado.stock;
        categoryInput.value = productData.productoEncontrado.category;

        // Mostrar la URL del thumbnail si está disponible
        if (productData.productoEncontrado.thumbnail) {
          thumbnailPreview.src = productData.productoEncontrado.thumbnail;
        } else {
          thumbnailPreview.src = ""; // Puedes establecer una imagen por defecto o un mensaje
        }

        // Establecer el ID del producto en un campo oculto
        productIdInput.value = productId;

        // Cambiar el texto y la funcionalidad del botón de enviar
        submitBtn.innerText = "Actualizar";
        submitBtn.removeEventListener("click", handleSubmit);
        submitBtn.addEventListener("click", handleUpdate);
      } catch (error) {
        console.error(
          "Error al obtener los datos del producto:",
          error.message
        );
      }
    }
  });
});

// Evento para actualizar un producto
async function handleUpdate(event) {
  event.preventDefault();

  const productId = productIdInput.value;
  const title = titleInput.value;
  const description = descriptionInput.value;
  const code = parseInt(codeInput.value);
  const price = parseFloat(priceInput.value);
  const stock = parseInt(stockInput.value);
  const category = categoryInput.value;
  const thumbnail = thumbnailInput.value; // Asegúrate de manejar la carga de archivos correctamente si es necesario

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const updatedProduct = await response.json();

    // Emitir evento de actualización de producto a través de Socket.io
    socket.emit("Product Update", updatedProduct.productoModificado);

    // Resetear el formulario después de la actualización
    productForm.reset();

    // Restaurar el texto y la funcionalidad del botón de enviar
    submitBtn.innerText = "Enviar";
    submitBtn.removeEventListener("click", handleUpdate);
    submitBtn.addEventListener("click", handleSubmit);
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
  }
}
