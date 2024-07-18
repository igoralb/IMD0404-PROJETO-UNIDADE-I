const loggedInUser = JSON.parse(localStorage.getItem("user"));
document.getElementById("navbarDropdown").textContent = loggedInUser.name;

if (loggedInUser) {
  document.getElementById("login").textContent = "";

  //   document.getElementById("cadastro").textContent = "";
}

function logout() {
  localStorage.removeItem("user");
  setTimeout(() => {
    location.reload();
  }, 1000);
}
