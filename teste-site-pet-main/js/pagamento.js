const currentUser = JSON.parse(localStorage.getItem("user"));

const paymentCard = document.getElementById("paymentCard");
const paymentPix = document.getElementById("paymentPix");
const paymentBoleto = document.getElementById("paymentBoleto");
const cardDetails = document.getElementById("cardDetails");

function toggleCardDetails() {
  if (paymentCard.checked) {
    cardDetails.style.display = "block";
  } else {
    cardDetails.style.display = "none";
  }
}

paymentCard.addEventListener("change", toggleCardDetails);
paymentPix.addEventListener("change", toggleCardDetails);
paymentBoleto.addEventListener("change", toggleCardDetails);

document.addEventListener("DOMContentLoaded", toggleCardDetails);

class Order {
  constructor({ id, userEmail, cidade, estado, rua, cep }) {
    this.id = id;
    this.userEmail = userEmail;
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
    userEmail: currentUser.email,
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    rua: formData.get("rua"),
    cep: formData.get("cep"),
  };
  if (currentUser) {
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
      // window.location.href = "./index.html";
    }, 1000);
  } else {
    alert("Para realizar uma compra, é preciso realizar Log-in.");
  }
}

function getUserOrders(userEmail) {
  return fetch("https://petshop-bca2a-default-rtdb.firebaseio.com/pedidos.json")
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        throw new Error("Nenhum pedido encontrado");
      }
      return data;
    })
    .catch((error) => {
      console.error("Erro ao buscar os pedidos:", error);
      throw error;
    });
}

function renderUserOrders() {
  const userOrdersContainer = document.getElementById("userOrdersContainer");
  userOrdersContainer.innerHTML = ""; // Limpa a lista antes de renderizar

  getUserOrders(currentUser.email)
    .then((orders) => {
      const ordersArray = Object.values(orders);
      ordersArray.forEach((order) => {
        const orderItem = document.createElement("div");
        orderItem.classList.add("order-item");
        orderItem.innerHTML = `
        <p>Cidade: ${order.cidade}</p>
        <p>Estado: ${order.estado}</p>
        <p>Rua: ${order.rua}</p>
        <p>CEP: ${order.cep}</p>
        <button>Editar</button>
        <button>Deletar</button>
      `;

        if (order.userEmail === currentUser.email) {
          userOrdersContainer.appendChild(orderItem);
        }
        orderItem.addEventListener("click", () =>
          selectAdress(order, orderItem)
        );
      });
    })
    .catch((error) => {
      console.error("Erro ao renderizar os pedidos:", error);
    });
}

function selectAdress(order, orderItem) {
  document
    .querySelectorAll(".order-item")
    .forEach((item) => item.classList.remove("selected"));
  orderItem.classList.add("selected");

  document.getElementById("cidade").value = order.cidade;
  document.getElementById("estado").value = order.estado;
  document.getElementById("rua").value = order.rua;
  document.getElementById("cep").value = order.cep;
}

document.addEventListener("DOMContentLoaded", renderUserOrders);
