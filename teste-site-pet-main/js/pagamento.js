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

// <img src="${selectedProduct.foto}" alt="${selectedProduct.titulo}" style="max-width: 200px;">
document.addEventListener("DOMContentLoaded", () => {
  toggleCardDetails();
  const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));
  console.log(selectedProduct);
  if (selectedProduct) {
    const produtoPrecoHTML = `
        <span>R$ ${selectedProduct.preco}</span>
    `;
    document.getElementById("produtoPreco").innerHTML = produtoPrecoHTML;
    document.getElementById("produtoPrecoTotal").innerHTML = produtoPrecoHTML;
    document.getElementById("produtoPrecoTotalH1").innerHTML = produtoPrecoHTML;
  } else {
    document.getElementById("produtoPreco").innerText =
      "Nenhum produto selecionado.";
  }
});

class Order {
  constructor({ id, userEmail, cidade, estado, rua, cep, saveAddress }) {
    this.id = id;
    this.userEmail = userEmail;
    this.cidade = cidade;
    this.estado = estado;
    this.rua = rua;
    this.cep = cep;
    this.saveAddress = saveAddress;
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
    saveAddress: formData.get("saveAddress") ? true : false,
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
      const ordersArray = Object.keys(orders).map((key) => ({
        id: key,
        ...orders[key],
      }));

      ordersArray.forEach((order) => {
        if (order.saveAddress) {
          const orderItem = document.createElement("div");
          orderItem.classList.add("order-item");
          orderItem.innerHTML = `
          <p><strong>Cidade:</strong> ${order.cidade}</p>
          <p><strong>Estado:</strong> ${order.estado}</p>
          <p><strong>Rua:</strong> ${order.rua}</p>
          <p><strong>CEP:</strong> ${order.cep}</p>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Deletar</button>
        `;

          // Botão de deletar
          const botao_deleta = orderItem.querySelector(".delete-btn");
          botao_deleta.className = "btn btn-outline-dark";
          botao_deleta.textContent = "Deletar";
          orderItem.appendChild(botao_deleta);

          botao_deleta.addEventListener("click", function (event) {
            event.stopPropagation();

            if (confirm("Tem certeza que deseja deletar esse endereço?")) {
              deleteAddress(order.id)
                .then(() => {
                  return getUserOrders(currentUser.email);
                })
                .then(() => {
                  renderUserOrders();
                })
                .catch((error) => {
                  console.error(
                    "Houve um problema ao deletar o endereço:",
                    error
                  );
                });
              alert("Endereço deletado");
            }
          });

          if (order.userEmail === currentUser.email) {
            userOrdersContainer.appendChild(orderItem);
          }

          orderItem.addEventListener("click", () =>
            selectAddress(order, orderItem)
          );

          // Botão de edição
          const editBtn = orderItem.querySelector(".edit-btn");
          editBtn.addEventListener("click", function (event) {
            event.stopPropagation(); //evita que a função selectAddress seja chamada
            showEditModal(order);
          });
        }
      });
    })
    .catch((error) => {
      console.error("Erro ao renderizar os pedidos:", error);
    });
}

function showEditModal(order) {
  document.getElementById("modalCidade").value = order.cidade;
  document.getElementById("modalEstado").value = order.estado;
  document.getElementById("modalRua").value = order.rua;
  document.getElementById("modalCep").value = order.cep;
  document.getElementById("modalOrderId").value = order.id;

  // abre o modal
  const modal = new bootstrap.Modal(document.getElementById("editOrderModal"));
  modal.show();
}

// Salvar as alterações do modal
document
  .getElementById("editOrderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const orderId = document.getElementById("modalOrderId").value;
    const updatedOrder = {
      cidade: document.getElementById("modalCidade").value,
      estado: document.getElementById("modalEstado").value,
      rua: document.getElementById("modalRua").value,
      cep: document.getElementById("modalCep").value,
      userEmail: currentUser.email,
      saveAddress: document.getElementById("saveAddress").value,
    };

    updateOrder(orderId, updatedOrder)
      .then(() => {
        return getUserOrders(currentUser.email);
      })
      .then(() => {
        renderUserOrders();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editOrderModal")
        );
        modal.hide();
      })
      .catch((error) => {
        console.error("Erro ao atualizar o endereço:", error);
      });
  });

function updateOrder(orderId, updatedOrder) {
  return fetch(
    `https://petshop-bca2a-default-rtdb.firebaseio.com/pedidos/${orderId}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedOrder),
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Erro ao atualizar o endereço");
    }
  });
}

function deleteAddress(orderId) {
  return fetch(
    `https://petshop-bca2a-default-rtdb.firebaseio.com/pedidos/${orderId}.json`,
    {
      method: "DELETE",
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Resposta de rede não foi ok");
    }
  });
}

function selectAddress(order, orderItem) {
  document
    .querySelectorAll(".order-item")
    .forEach((item) => item.classList.remove("selected"));
  orderItem.classList.add("selected");
  getUserOrders(order);
  if (order.id) {
    document.getElementById("cidade").value = order.cidade;
    document.getElementById("estado").value = order.estado;
    document.getElementById("rua").value = order.rua;
    document.getElementById("cep").value = order.cep;
  }
}

document.addEventListener("DOMContentLoaded", renderUserOrders);
