const loggedInUser = JSON.parse(localStorage.getItem("user"));

class Order {
  constructor({ id, cidade, estado, rua, cep }) {
    this.id = id;
    this.cidade = cidade;
    this.estado = estado;
    this.rua = rua;
    this.cep = cep;
  }
}

const createOrderForm = document.getElementById("createOrderForm");
createOrderForm.addEventListener("submit", createOrder);

function newOrder(orderData) {
  return fetch(
    "https://petshop-bca2a-default-rtdb.firebaseio.com/pedidos.json",

    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Resposta de rede não foi ok");
    }
  });
}

function createOrder(event) {
  event.preventDefault();

  const formData = new FormData(createOrderForm);
  const submit = document.getElementById("submit_button");

  const orderData = {
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    rua: formData.get("rua"),
    cep: formData.get("cep"),
  };
  if (loggedInUser) {
    newOrder(orderData)
      .then(() => {
        createOrderForm.reset();
      })
      .catch((error) => {
        console.error("Houve um erro", error);
      });
    console.log("foi");

    setTimeout(() => {
      alert("Compra realizada!");
      window.location.href = "./index.html";
    }, 1000);
  } else {
    alert("Para realizar uma compra, é preciso realizar Log-in.");
  }
}
