class User {
  constructor({ id, name, email, password }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

const createUserForm = document.getElementById("createUserForm");
createUserForm.addEventListener("submit", register);

function newUser(userData) {
  return fetch(
    "https://petshop-bca2a-default-rtdb.firebaseio.com/users.json",

    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Resposta de rede não foi ok");
    }
  });
}

function register(event) {
  event.preventDefault();

  console.log("heyy");
  const formData = new FormData(createUserForm);

  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  console.log("oiiiii");

  newUser(userData)
    .then(() => {
      createUserForm.reset();
    })
    .catch((error) => {
      console.error("houve um erro", error);
    });
  console.log("foi");
}
