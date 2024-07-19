const socket = io();


//acá la lógica para el formulario
let user;
let chatBox = document.getElementById("chatBox");

Swal.fire({
  title: "Identificación con nombre de usuario",
  input: "text",
  text: "ingresa tu nombre",
  icon: "success",
  inputValidator: (value) => {
    return !value && "Necesitas identificarte";
    allowOutsideClick: false;
  },
}).then((result) => {
  (user = result.value), console.log(user);
});
//acá estoy en modo cliente. Necesito el handshake

// socket.emit("message", "Soy un mensaje");

chatBox.addEventListener("keyup", (evt) => {
  if (evt.key === "Enter" && chatBox.value.trim().length > 0) {
    socket.emit("message", { user: user, message: chatBox.value });
    chatBox.value = "";
  }
});

socket.on("messageLogs", (data) => {
  let log = document.getElementById("messageLogs");
  let messages = "";
  data.forEach((message) => {
    messages = messages + `${message.user} dice: ${message.message}</br>`;

    log.innerHTML = messages;
  });
});
