document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const nameInput = document.getElementById("name");
  const editBtn = document.getElementById("edit-btn");
  const updateBtn = document.getElementById("update-btn");
  const deleteBtn = document.getElementById("delete-btn");

  // Obtém a chave do usuário armazenada no localStorage
  const userKey = localStorage.getItem("userKey");

  // Carrega os dados do usuário no formulário
  function loadUserData() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      emailInput.value = user.email;
      passwordInput.value = user.password;
      nameInput.value = user.name;
    } else {
      alert("Logue primeiro para usar esse recurso.");
      console.log("Nenhum usuário logado encontrado.");
    }
  }

  loadUserData();

  // Habilita a edição dos campos
  editBtn.addEventListener("click", () => {
    emailInput.removeAttribute("readonly");
    passwordInput.removeAttribute("readonly");
    nameInput.removeAttribute("readonly");

    editBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
  });

  // Atualiza os dados do usuário
  updateBtn.addEventListener("click", () => {
    const updatedData = {
      email: emailInput.value,
      password: passwordInput.value,
      name: nameInput.value,
    };

    // Atualiza os dados no Firebase usando a chave do usuário
    fetch(
      `https://petshop-bca2a-default-rtdb.firebaseio.com/users/${userKey}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        alert("Informações atualizadas com sucesso!");

        // Atualiza os dados no localStorage
        localStorage.setItem("user", JSON.stringify(updatedData));

        // Desabilita a edição dos campos
        emailInput.setAttribute("readonly", true);
        passwordInput.setAttribute("readonly", true);
        nameInput.setAttribute("readonly", true);

        updateBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      })
      .catch((error) => {
        console.error("Erro ao atualizar dados do usuário:", error);
      });
  });

  // Deleta o usuário
  deleteBtn.addEventListener("click", () => {
    fetch(
      `https://petshop-bca2a-default-rtdb.firebaseio.com/users/${userKey}.json`,
      {
        method: "DELETE",
      }
    )
      .then(() => {
        alert("Usuário deletado com sucesso!");
        localStorage.removeItem("userKey");
        localStorage.removeItem("user");
        emailInput.value = "";
        passwordInput.value = "";
        nameInput.value = "";

        // Redireciona para a página inicial
        setTimeout(() => {
          window.location.href = "./index.html";
        }, 1000); // Aguarda 1 segundo antes de redirecionar
      })
      .catch((error) => {
        console.error("Erro ao deletar dados do usuário:", error);
      });
  });
});
