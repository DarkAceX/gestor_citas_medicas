// Toggle entre login y registro
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.querySelectorAll(".toggle-btn")[0].classList.add("active");
  document.querySelectorAll(".toggle-btn")[1].classList.remove("active");
  clearMessages();
}

function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.querySelectorAll(".toggle-btn")[1].classList.add("active");
  document.querySelectorAll(".toggle-btn")[0].classList.remove("active");
  clearMessages();
}

function clearMessages() {
  document.getElementById("successMessage").style.display = "none";
  document.querySelectorAll(".error-message").forEach((msg) => {
    msg.style.display = "none";
  });
  document.querySelectorAll(".form-group input").forEach((input) => {
    input.classList.remove("error");
  });
}

// Validación en tiempo real
function validateField(input, validationFn, errorMessage) {
  const errorDiv = input.nextElementSibling;
  if (validationFn(input.value)) {
    input.classList.remove("error");
    errorDiv.style.display = "none";
    return true;
  } else {
    input.classList.add("error");
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = "block";
    return false;
  }
}

// Event listeners para validación
document.addEventListener("DOMContentLoaded", function () {
  // Validación de email
  document.getElementById("correo").addEventListener("blur", function () {
    validateField(
      this,
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Ingresa un correo electrónico válido"
    );
  });

  // Validación de teléfono
  document.getElementById("telefono").addEventListener("blur", function () {
    validateField(
      this,
      (value) => /^\+?[\d\s\-\(\)]{8,}$/.test(value),
      "Ingresa un número de teléfono válido"
    );
  });

  // Validación de contraseña
  document
    .getElementById("registerPassword")
    .addEventListener("blur", function () {
      validateField(
        this,
        (value) => value.length >= 6,
        "La contraseña debe tener al menos 6 caracteres"
      );
    });

  // Validación de confirmación de contraseña
  document
    .getElementById("confirmPassword")
    .addEventListener("blur", function () {
      const password = document.getElementById("registerPassword").value;
      validateField(
        this,
        (value) => value === password,
        "Las contraseñas no coinciden"
      );
    });

  // Manejar envío de formularios
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    handleFormSubmit(this, "login");
  });

  document
    .getElementById("registerForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      handleFormSubmit(this, "register");
    });
});

function handleFormSubmit(form, type) {
  const submitBtn = form.querySelector(".submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");

  // Mostrar loading
  btnText.innerHTML = '<span class="loading"></span>Procesando...';
  submitBtn.disabled = true;

  // Simular envío (aquí conectarías con tu backend)
  setTimeout(() => {
    if (type === "register") {
      // Simular registro exitoso
      document.getElementById("successMessage").style.display = "block";
      form.reset();
      setTimeout(() => {
        showLogin();
      }, 2000);
    } else {
      // Aquí podrías redirigir al dashboard o mostrar error
      console.log("Login attempt with:", {
        username: form.username.value,
        password: form.password.value,
      });
    }

    // Restaurar botón
    btnText.textContent = type === "login" ? "Iniciar Sesión" : "Crear Cuenta";
    submitBtn.disabled = false;
  }, 2000);
}

function showForgotPassword() {
  alert(
    "Funcionalidad de recuperación de contraseña. Aquí implementarías el flujo de reset de password."
  );
}
