class Product {
  constructor({ id, marca, preco, titulo, foto, categoria }) {
    this.id = id;
    this.marca = marca;
    this.preco = preco;
    this.titulo = titulo;
    this.foto = foto;
    this.categoria = categoria;
  }
}

const currentUser = JSON.parse(localStorage.getItem("user"));

function checkAdmin() {
  const addProductBtn = document.getElementById("addProduct-btn");

  if (currentUser === null) {
    addProductBtn.style.display = "none";
    return;
  }

  if (currentUser.email === "admin@gmail.com") {
    addProductBtn.style.display = "flex";
  } else {
    addProductBtn.style.display = "none";
  }
}

const createProductForm = document.getElementById("createProductForm");
createProductForm.addEventListener("submit", createProduct);

function newProduct(productData) {
  return fetch(
    "https://petshop-bca2a-default-rtdb.firebaseio.com/produtos.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Resposta de rede não foi ok");
    }
    return response.json();
  });
}

function createProduct(event) {
  event.preventDefault();

  const formData = new FormData(createProductForm);

  const productData = {
    marca: formData.get("modalMarca"),
    preco: formData.get("modalPreco"),
    titulo: formData.get("modalTitulo"),
    foto: formData.get("modalFoto"),
    categoria: formData.get("modalCategoria"),
  };

  newProduct(productData)
    .then((data) => {
      createProductForm.reset();
      alert("Produto adicionado!");
      renderProducts();
    })
    .catch((error) => {
      console.error("Houve um erro", error);
      alert("Erro ao adicionar produto.");
    });
}

const addProduct = document.getElementById("addProduct-btn");
addProduct.addEventListener("click", function () {
  showAddModal();
});

function showAddModal() {
  const modal = new bootstrap.Modal(document.getElementById("addModal"));
  modal.show();
}

function showEditModal(product) {
  document.getElementById("editModalMarca").value = product.marca;
  document.getElementById("editModalTitulo").value = product.titulo;
  document.getElementById("editModalFoto").value = product.foto;
  document.getElementById("editModalPreco").value = product.preco;
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editModalCategoria").value = product.categoria;

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

function getProducts() {
  return fetch(
    "https://petshop-bca2a-default-rtdb.firebaseio.com/produtos.json"
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        throw new Error("Nenhum produto encontrado");
      }
      return data;
    })
    .catch((error) => {
      console.error("Erro ao buscar os produtos:", error);
      throw error;
    });
}

function renderProducts() {
  const cachorroContainer = document.getElementById("cachorroContainer");
  const gatoContainer = document.getElementById("gatoContainer");
  cachorroContainer.innerHTML = "";
  gatoContainer.innerHTML = "";

  getProducts()
    .then((products) => {
      const productsArray = Object.keys(products).map((key) => ({
        id: key,
        ...products[key],
      }));
      productsArray.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.className = "produto";

        if (currentUser === null) {
          productDiv.innerHTML = `
            <img src="${product.foto}" alt="">
            <div class="descricao">
              <span>${product.marca}</span>
              <h5>${product.titulo}</h5>
              <h4>R$ ${product.preco}</h4>
            </div>
            <a href="#" class="btn btn-success buy-btn" data-id="${product.id}">Comprar</a>
          `;
        } else if (currentUser.email === "admin@gmail.com") {
          productDiv.innerHTML = `
            <img src="${product.foto}" alt="">
            <div class="descricao">
              <span>${product.marca}</span>
              <h5>${product.titulo}</h5>
              <h4>R$ ${product.preco}</h4>
            </div>
            <button class="btn btn-primary edit-btn" data-id="${product.id}">Editar</button>
            <button class="btn btn-danger delete-btn" data-id="${product.id}">Deletar</button>
          `;
        } else {
          productDiv.innerHTML = `
            <img src="${product.foto}" alt="">
            <div class="descricao">
              <span>${product.marca}</span>
              <h5>${product.titulo}</h5>
              <h4>R$ ${product.preco}</h4>
            </div>
            <a href="pagamento.html" class="btn btn-success buy-btn" data-id="${product.id}">Comprar</a>
          `;
        }

        if (product.categoria === "cachorro") {
          cachorroContainer.appendChild(productDiv);
        } else if (product.categoria === "gato") {
          gatoContainer.appendChild(productDiv);
        }
      });

      document.querySelectorAll(".buy-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          if (currentUser === null) {
            alert("É preciso logar primeiro para fazer uma compra.");
            return;
          }
          const productId = event.target.dataset.id;
          const product = productsArray.find((p) => p.id === productId);
          localStorage.setItem("selectedProduct", JSON.stringify(product));
        });
      });

      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.id;
          const product = productsArray.find((p) => p.id === productId);
          showEditModal(product);
        });
      });

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.id;
          deleteProduct(productId);
        });
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar produtos:", error);
    });
}

document
  .getElementById("editProductForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const updatedProduct = {
      marca: document.getElementById("editModalMarca").value,
      titulo: document.getElementById("editModalTitulo").value,
      foto: document.getElementById("editModalFoto").value,
      preco: document.getElementById("editModalPreco").value,
      categoria: document.getElementById("editModalCategoria").value,
    };
    const productId = document.getElementById("editProductId").value;
    updateProduct(productId, updatedProduct)
      .then(() => {
        renderProducts();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editModal")
        );
        modal.hide();
      })
      .catch((error) => {
        console.error("Erro ao atualizar o produto:", error);
      });
  });

function updateProduct(productId, updatedProduct) {
  return fetch(
    `https://petshop-bca2a-default-rtdb.firebaseio.com/produtos/${productId}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Erro ao atualizar o produto");
    }
  });
}

function deleteProduct(productId) {
  return fetch(
    `https://petshop-bca2a-default-rtdb.firebaseio.com/produtos/${productId}.json`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao deletar produto.");
      }
      console.log("Produto deletado:", productId);
      renderProducts(); // Re-renderiza a lista de produtos
    })
    .catch((error) => {
      console.error("Erro ao deletar produto:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  checkAdmin();
});
