// main.js - Archivo principal que consolida la lógica de navegación, validación y manejo de formularios.

// ==========================================
// Funciones de navegación entre formularios
// ==========================================
// Controlan la visibilidad de los diferentes formularios en la página de login.

// Muestra el formulario de inicio de sesión y oculta los demás.
function showLogin() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("forgotPasswordForm").classList.add("hidden");
    document.getElementById("formToggle").classList.remove("hidden"); // Muestra los botones de toggle Login/Register
    document.querySelectorAll(".toggle-btn")[0].classList.add("active");
    document.querySelectorAll(".toggle-btn")[1].classList.remove("active");
    clearMessages(); // Limpia mensajes de estado y errores al cambiar de formulario
}

// Muestra el formulario de registro y oculta los demás.
function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("forgotPasswordForm").classList.add("hidden");
    document.getElementById("formToggle").classList.remove("hidden"); // Muestra los botones de toggle Login/Register
    document.querySelectorAll(".toggle-btn")[1].classList.add("active");
    document.querySelectorAll(".toggle-btn")[0].classList.remove("active");
    clearMessages(); // Limpia mensajes de estado y errores
}

// Muestra el formulario de restablecimiento de contraseña y oculta los demás.
function showForgotPassword() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("forgotPasswordForm").classList.remove("hidden");
    document.getElementById("formToggle").classList.add("hidden"); // Oculta los botones de toggle Login/Register
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    clearMessages(); // Limpia mensajes de estado y errores
    // Opcional: Limpiar campos específicos del formulario de restablecimiento al mostrarlo
    document.getElementById("newPasswordSimple").value = "";
    document.getElementById("confirmNewPasswordSimple").value = "";
}

// ==========================================
// Funciones de utilidad
// ==========================================

// Limpia los mensajes de éxito y error, y remueve las clases de error de los inputs.
function clearMessages() {
    document.getElementById("successMessage").style.display = "none";
    document.querySelectorAll(".error-message").forEach((msg) => {
        msg.style.display = "none";
    });
    document.querySelectorAll(".form-group input").forEach((input) => {
        input.classList.remove("error");
    });
}

// Valida un campo de input específico usando una función de validación proporcionada.
// Muestra u oculta el mensaje de error asociado.
function validateField(input, validationFn, errorMessage) {
    const errorDiv = input.nextElementSibling; // Asume que el div de error es el siguiente hermano del input
    if (validationFn(input.value)) {
        input.classList.remove("error");
        errorDiv.style.display = "none";
        return true; // El campo es válido
    } else {
        input.classList.add("error");
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = "block";
        return false; // El campo no es válido
    }
}

// Obtiene los valores de los campos de formulario especificados por sus IDs.
// Retorna un objeto con los IDs como claves y los valores de los inputs como valores.
function getFormData(form, fieldIds) {
    const data = {};
    fieldIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            data[id] = element.value;
        } else {
            console.warn(`Elemento con ID ${id} no encontrado en el formulario.`);
            data[id] = ""; // Asigna cadena vacía o maneja según necesidad si el elemento no existe
        }
    });
    return data;
}

// Determina el texto a mostrar en el botón de envío según el tipo de formulario.
function getButtonText(type) {
    switch (type) {
        case "login":
            return "Iniciar Sesión";
        case "register":
            return "Crear Cuenta";
        case "forgot_password":
            return "Restablecer Contraseña";
        default:
            return ""; // Texto por defecto si el tipo no es reconocido
    }
}

// ==========================================
// Funciones de validación de formularios completos
// ==========================================
// Usan validateField para validar todos los campos requeridos de un formulario específico.

// Valida todos los campos del formulario de registro.
function validateRegisterForm(data) {
    // Obtiene referencias a los elementos de input específicos del formulario de registro
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const correoInput = document.getElementById("correo");
    const telefonoInput = document.getElementById("telefono");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    // Realiza las validaciones de cada campo y devuelve true solo si todos son válidos.
    return (
        validateField(nombreInput, (value) => value.trim() !== "", "Ingresa tu nombre") &&
        validateField(apellidoInput, (value) => value.trim() !== "", "Ingresa tu apellido") &&
        validateField(correoInput, (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Ingresa un correo electrónico válido") && // Regex básica para correo
        validateField(telefonoInput, (value) => /^\+?[\d\s\-\(\)]{8,}$/.test(value), "Ingresa un número de teléfono válido") && // Regex básica para teléfono
        validateField(passwordInput, (value) => value.length >= 6, "La contraseña debe tener al menos 6 caracteres") &&
        validateField(confirmPasswordInput, (value) => value === passwordInput.value, "Las contraseñas no coinciden")
    );
}

// Valida todos los campos del formulario de inicio de sesión.
function validateLoginForm(data) {
    // Obtiene referencias a los elementos de input
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");

    // Realiza las validaciones y devuelve true solo si ambos campos son válidos.
    return (
        validateField(usernameInput, (value) => value.trim() !== "", "Este campo es requerido") &&
        validateField(passwordInput, (value) => value.trim() !== "", "Este campo es requerido")
    );
}

// Valida todos los campos del formulario de restablecimiento de contraseña.
function validatePasswordResetForm(data) {
    // Obtiene referencias a los elementos de input
    const emailInput = document.getElementById("resetEmail");
    const newPasswordInput = document.getElementById("newPasswordSimple");
    const confirmNewPasswordInput = document.getElementById("confirmNewPasswordSimple");

    // Realiza las validaciones y devuelve true solo si todos los campos son válidos.
    return (
        validateField(emailInput, (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Ingresa un correo electrónico válido") && // Regex básica para correo
        validateField(newPasswordInput, (value) => value.length >= 6, "La contraseña debe tener al menos 6 caracteres") &&
        validateField(confirmNewPasswordInput, (value) => value === newPasswordInput.value, "Las contraseñas no coinciden")
    );
}

// ==========================================
// Funciones de manejo de envío de formularios
// ==========================================
// Contienen la lógica para recolectar datos, validar y enviar al backend.

// Maneja la lógica específica para el envío del formulario de registro.
// Recibe el formulario (HTMLFormElement) y el elemento donde mostrar mensajes de éxito.
async function handleRegister(form, successMessageDiv) {
    // Obtiene los datos del formulario usando getFormData
    const formData = getFormData(form, [
        "nombre", "apellido", "correo", "telefono",
        "registerPassword", "confirmPassword"
    ]);

    // Valida los datos del formulario de registro usando validateRegisterForm
    if (!validateRegisterForm(formData)) {
        // Si la validación falla, lanza un error. El bloque catch en handleFormSubmit lo capturará.
        throw new Error("Por favor, corrige los errores en el formulario.");
    }

    // Realiza la petición POST al endpoint de registro del backend
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            correo: formData.correo,
            telefono: formData.telefono,
            password: formData.registerPassword, // Envía la contraseña
        }),
    });

    // Procesa la respuesta JSON del backend
    const result = await response.json();

    // Verifica si la respuesta HTTP fue exitosa (status code 2xx)
    if (!response.ok) {
        // Si no fue exitosa, lanza un error con el mensaje del backend o un mensaje genérico.
        throw new Error(result.message || `Error en el registro: ${response.status}`);
    }

    // Si el registro es exitoso:
    console.log("Registro exitoso:", result); // Log en consola
    successMessageDiv.textContent = result.message || "¡Registro exitoso! Ahora puedes iniciar sesión."; // Muestra mensaje de éxito en el div
    successMessageDiv.style.display = "block"; // Hace visible el div de éxito
    form.reset(); // Resetea el formulario
    setTimeout(showLogin, 2000); // Espera 2 segundos y cambia al formulario de login
}

// Maneja la lógica específica para el envío del formulario de inicio de sesión.
// Recibe el formulario (HTMLFormElement).
async function handleLogin(form) {
    // Obtiene los datos del formulario usando getFormData
    const formData = getFormData(form, ["loginUsername", "loginPassword"]);

    // Valida los datos del formulario de login usando validateLoginForm
    if (!validateLoginForm(formData)) {
        // Si la validación falla, lanza un error.
        throw new Error("Por favor, ingresa usuario/email y contraseña.");
    }

    // Realiza la petición POST al endpoint de login del backend
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: formData.loginUsername, // Puede ser correo o nombre de usuario
            password: formData.loginPassword, // Envía la contraseña
        }),
    });

    // Procesa la respuesta JSON del backend
    const result = await response.json();

    // Verifica si la respuesta HTTP fue exitosa
    if (!response.ok) {
        // Si no fue exitosa, lanza un error con el mensaje del backend o un mensaje genérico.
        const errorMessage = result.message || `Error en el inicio de sesión: ${response.status}`;
        const backendError = new Error(errorMessage);
        backendError.backendError = errorMessage; // Adjunta el mensaje del backend si está disponible
        throw backendError;
    }

    // Si el inicio de sesión es exitoso:
    console.log("Inicio de sesión exitoso:", result); // Log en consola
    if (result.redirect) {
        window.location.href = result.redirect; // Redirige si el backend especifica una URL
    }
}

// Maneja la lógica específica para el envío del formulario de restablecimiento de contraseña.
// Recibe el formulario (HTMLFormElement) y el elemento donde mostrar mensajes de éxito (aunque se usa alert para el éxito).
async function handlePasswordReset(form, successMessageDiv) {
    // Obtiene los datos del formulario usando getFormData
    const formData = getFormData(form, [
        "resetEmail", "newPasswordSimple", "confirmNewPasswordSimple"
    ]);

    // Valida los datos del formulario de restablecimiento usando validatePasswordResetForm
    if (!validatePasswordResetForm(formData)) {
        // Si la validación falla, lanza un error.
        throw new Error("Por favor, corrige los errores en el formulario.");
    }

    // Realiza la petición POST al endpoint de restablecimiento del backend
    const response = await fetch('/api/reset_password_simple', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            correo: formData.resetEmail,
            password: formData.newPasswordSimple, // Envía la nueva contraseña
            confirm_password: formData.confirmNewPasswordSimple // Envía la confirmación
        }),
    });

    // Procesa la respuesta JSON del backend
    const result = await response.json();

    // Verifica si la respuesta HTTP fue exitosa
    if (!response.ok) {
        // Si no fue exitosa, lanza un error con el mensaje del backend o un mensaje genérico.
        throw new Error(result.message || `Error al restablecer la contraseña: ${response.status}`);
    }

    // Si el restablecimiento es exitoso:
    alert(result.message || "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión."); // Muestra un mensaje de éxito en una alerta
    form.reset(); // Resetea el formulario
    setTimeout(showLogin, 2000); // Espera 2 segundos y cambia al formulario de login
}

// Función principal para manejar el envío de cualquier formulario (login, register, forgot_password)
// Recibe el formulario (HTMLFormElement) y el tipo de formulario (string: \'login\', \'register\', \'forgot_password\')
// Esta función actúa como un orquestador llamando a las funciones específicas de manejo de formulario.
async function handleFormSubmit(form, type) {
    // Selecciona los elementos del botón de envío y el div de mensaje de éxito
    const submitBtn = form.querySelector(".submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const successMessageDiv = document.getElementById("successMessage");

    // Limpia mensajes de error y éxito anteriores al iniciar el proceso
    clearMessages();

    // Muestra estado de carga y deshabilita el botón para evitar múltiples envíos
    btnText.innerHTML = '<span class="loading"></span>Procesando...';
    submitBtn.disabled = true;

    try {
        // Usa un switch para delegar el manejo al handler específico según el tipo de formulario
        switch (type) {
            case "register":
                await handleRegister(form, successMessageDiv);
                break;
            case "login":
                await handleLogin(form);
                break;
            case "forgot_password":
                await handlePasswordReset(form, successMessageDiv);
                break;
            default:
                // Lanza un error si el tipo de formulario no es reconocido para un manejo centralizado
                throw new Error("Tipo de formulario no válido");
        }
    } catch (error) {
        // Manejo centralizado de errores: imprime en consola y muestra una alerta al usuario
        console.error("Error en el formulario:", error);
        alert("Error: " + (error.message || "Algo salió mal. Intenta de nuevo."));
    } finally {
        // Se ejecuta siempre al finalizar el try...catch, restaurando el estado del botón
        btnText.textContent = getButtonText(type); // Restaura el texto original del botón
        submitBtn.disabled = false; // Habilita el botón nuevamente
    }
}


// ==========================================
// Inicialización de Event Listeners
// ==========================================
// Configura los listeners para la validación en tiempo real, envío de formularios y navegación.
// Se ejecuta una vez que el DOM ha cargado completamente.

document.addEventListener("DOMContentLoaded", function () {
    // Configura event listeners para la validación de campos al perder el foco (evento 'blur').
    // Cada listener llama a validateField con la lógica de validación y mensaje de error específicos.

    // Listener para validación del campo 'correo'
    const correoInput = document.getElementById("correo");
    if (correoInput) { // Verifica si el elemento existe antes de añadir listener
        correoInput.addEventListener("blur", function () {
            validateField(
                this,
                (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                "Ingresa un correo electrónico válido"
            );
        });
    }


    // Listener para validación del campo 'telefono'
    const telefonoInput = document.getElementById("telefono");
    if (telefonoInput) { // Verifica si el elemento existe
        telefonoInput.addEventListener("blur", function () {
            validateField(
                this,
                (value) => /^\+?[\d\s\-\(\)]{8,}$/.test(value),
                "Ingresa un número de teléfono válido"
            );
        });
    }

    // Listener para validación del campo 'registerPassword'
    const registerPasswordInput = document.getElementById("registerPassword");
    if (registerPasswordInput) { // Verifica si el elemento existe
        registerPasswordInput.addEventListener("blur", function () {
            validateField(
                this,
                (value) => value.length >= 6,
                "La contraseña debe tener al menos 6 caracteres"
            );
        });
    }


    // Listener para validación del campo 'confirmPassword'
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) { // Verifica si el elemento existe
        confirmPasswordInput.addEventListener("blur", function () {
            const password = document.getElementById("registerPassword") ? document.getElementById("registerPassword").value : null;
            // Solo valida si el campo de contraseña original existe
            if (password !== null) {
                validateField(
                    this,
                    (value) => value === password,
                    "Las contraseñas no coinciden"
                );
            }
        });
    }


    // Listener para validación del campo 'newPasswordSimple' (restablecimiento)
    const newPasswordSimpleInput = document.getElementById("newPasswordSimple");
    if (newPasswordSimpleInput) { // Verifica si el elemento existe
        newPasswordSimpleInput.addEventListener("blur", function () {
            validateField(
                this,
                (value) => value.length >= 6,
                "La contraseña debe tener al menos 6 caracteres"
            );
        });
    }


    // Listener para validación del campo 'confirmNewPasswordSimple' (restablecimiento)
    const confirmNewPasswordSimpleInput = document.getElementById("confirmNewPasswordSimple");
    if (confirmNewPasswordSimpleInput) { // Verifica si el elemento existe
        confirmNewPasswordSimpleInput.addEventListener("blur", function () {
            const newPassword = document.getElementById("newPasswordSimple") ? document.getElementById("newPasswordSimple").value : null;
            // Solo valida si el campo de nueva contraseña original existe
            if (newPassword !== null) {
                validateField(
                    this,
                    (value) => value === newPassword,
                    "Las contraseñas no coinciden"
                );
            }
        });
    }


    // Configura event listeners para el envío de cada formulario.
    // Previene el envío por defecto del formulario HTML y llama a handleFormSubmit
    // con el formulario actual ('this') y el tipo de formulario ('login', 'register', etc.).

    const loginForm = document.getElementById("loginForm");
    if (loginForm) { // Verifica si el formulario existe
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Previene el envío por defecto
            handleFormSubmit(this, "login"); // Llama al manejador principal
        });
    }


    const registerForm = document.getElementById("registerForm");
    if (registerForm) { // Verifica si el formulario existe
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Previene el envío por defecto
            handleFormSubmit(this, "register"); // Llama al manejador principal
        });
    }


    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) { // Verifica si el formulario existe
        forgotPasswordForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Previene el envío por defecto
            handleFormSubmit(this, "forgot_password"); // Llama al manejador principal
        });
    }


    // Configura event listeners para los botones y enlaces de navegación entre formularios.
    // Llaman a las funciones showLogin, showRegister, showForgotPassword.

    // Listener para los botones de toggle (Login/Register)
    // Asumimos que los botones con clase 'toggle-btn' existen en el HTML.
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    if (toggleButtons.length > 0) {
        // Listener para el primer botón (usualmente Login)
        toggleButtons[0].addEventListener("click", function (e) {
            e.preventDefault(); // Previene la acción por defecto del enlace/botón
            showLogin(); // Llama a la función de navegación
        });

        // Listener para el segundo botón (usualmente Register)
        if (toggleButtons.length > 1) { // Asegura que existe el segundo botón
            toggleButtons[1].addEventListener("click", function (e) {
                e.preventDefault(); // Previene la acción por defecto
                showRegister(); // Llama a la función de navegación
            });
        }
    }

    // Listener para el enlace "¿Olvidaste tu contraseña?"
    // Asumimos que el enlace con clase 'forgot-password' existe.
    const forgotPasswordLink = document.querySelector(".forgot-password a");
    if (forgotPasswordLink) { // Verifica si el enlace existe
        forgotPasswordLink.addEventListener("click", function (e) {
            e.preventDefault(); // Previene la acción por defecto
            showForgotPassword(); // Llama a la función de navegación
        });
    }

    // Listener para el enlace "Volver a Iniciar Sesión" en el formulario de restablecimiento
    // Asumimos que el enlace con clase 'back-to-login' existe.
    const backToLoginLink = document.querySelector(".back-to-login a");
    if (backToLoginLink) { // Verifica si el enlace existe
        backToLoginLink.addEventListener("click", function (e) {
            e.preventDefault(); // Previene la acción por defecto
            showLogin(); // Llama a la función de navegación
        });
    }
});