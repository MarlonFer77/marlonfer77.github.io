document.getElementById("form-contato").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("mensagem-enviada").style.display = "block";
    this.reset();
  });

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    document.getElementById("btn-toggle").textContent = newTheme === "dark" ? "Light" : "Dark";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.getElementById("btn-toggle").textContent = savedTheme === "dark" ? "Tema claro" : "Tema escuro";
  });