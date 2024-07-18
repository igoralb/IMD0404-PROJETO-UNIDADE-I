const loginButton = document.getElementById("login_button");

const loginUserForm = document.getElementById("loginUserForm");

function getUser() {
  return fetch("https://petshop-bca2a-default-rtdb.firebaseio.com/users.json")
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        throw new Error("Nenhum usuário encontrado");
      }
      return data;
    })
    .catch((error) => {
      console.error("Erro ao buscar o usuário:", error);
      throw error;
    });
}

loginUserForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  login(email, password);
});

function login(email, password) {
  getUser().then((users) => {
    const userArray = Object.values(users);
    const user = userArray.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Usuário logado.");

      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1000);
    } else {
      alert("Email ou senha incorretos.");
      console.log("ERROR");
    }
  });
}
