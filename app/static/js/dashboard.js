// --- Funciones para el Modal de Agendar Cita ---
function modalAgendarCitas() {
  document.getElementById("modal_agendarCita").classList.remove("hidden");
  cargarEspecialidades();
}

function closeModalAgendarCita() {
  document.getElementById("modal_agendarCita").classList.add("hidden");
  document.getElementById("form_agendar").reset();
  document.getElementById("especialidad").innerHTML =
    '<option value="">Seleccione una especialidad</option>';
  document.getElementById("doctor").innerHTML =
    '<option value="">Seleccione un doctor</option>';
}

// --- Funciones para el Modal de Citas Pendientes ---
function modalCitasPendientes() {
  const modal = document.getElementById("modal_citasPendientes");
  modal.classList.remove("hidden");
  cargarCitasPendientes();
  deshabilitarBotonesAccionCita();
}

function closeModalCitasPendientes() {
  const modal = document.getElementById("modal_citasPendientes");
  modal.classList.add("hidden");
  document.getElementById("citas_pendientes_container").innerHTML =
    "<p>Cargando citas...</p>";
  deshabilitarBotonesAccionCita();
}

// --- Funciones para el Modal de Pago ---
function modalPago(citaId, monto) {
  const modal = document.getElementById("modal_pago");
  modal.classList.remove("hidden");
  document.getElementById("monto_pago").value = monto;
  document.getElementById("form_pago").dataset.citaId = citaId;
  document.getElementById("form_pago").reset();
  document.getElementById("card_details").style.display = "none";
}

function closeModalPago() {
  const modal = document.getElementById("modal_pago");
  modal.classList.add("hidden");
  document.getElementById("form_pago").reset();
  document.getElementById("card_details").style.display = "none";
}

// --- NUEVAS Funciones para el Modal de Historial de Citas ---
function modalHistorialCitas() {
  const modal = document.getElementById("modal_historialCitas");
  modal.classList.remove("hidden");
  cargarHistorialCitas(); // Función para cargar los datos del historial
}

function closeModalHistorialCitas() {
  const modal = document.getElementById("modal_historialCitas");
  modal.classList.add("hidden");
  document.getElementById("historial_citas_container").innerHTML =
    "<p>Cargando historial...</p>"; // Resetear al cerrar
}

// --- Cierre de Modales al hacer clic fuera ---
window.addEventListener("click", function (e) {
  const modalAgendar = document.getElementById("modal_agendarCita");
  const modalPendientes = document.getElementById("modal_citasPendientes");
  const modalPago = document.getElementById("modal_pago");
  const modalHistorial = document.getElementById("modal_historialCitas"); // Nuevo

  if (e.target === modalAgendar) {
    closeModalAgendarCita();
  }
  if (e.target === modalPendientes) {
    closeModalCitasPendientes();
  }
  if (e.target === modalPago) {
    closeModalPago();
  }
  if (e.target === modalHistorial) {
    // Nuevo
    closeModalHistorialCitas();
  }
});

// --- Carga de Especialidades (sin cambios) ---
async function cargarEspecialidades() {
  try {
    const response = await fetch("/api/especialidades");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const select = document.getElementById("especialidad");
    select.innerHTML = '<option value="">Seleccione una especialidad</option>';
    data.forEach((especialidad) => {
      const option = document.createElement("option");
      option.value = especialidad.id;
      option.textContent = especialidad.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar especialidades:", error);
    alert("Error al cargar las especialidades. Por favor, recargue la página.");
  }
}

// --- Carga de Doctores según especialidad (sin cambios) ---
async function cargarDoctores(idEspecialidad) {
  const doctorSelect = document.getElementById("doctor");
  doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>'; // Limpiar opciones

  if (idEspecialidad) {
    console.log("Solicitando doctores para especialidad ID:", idEspecialidad); // Log antes de la solicitud
    try {
      const response = await fetch(`/api/doctores/${idEspecialidad}`);

      // Primero, verifica si la respuesta fue exitosa a nivel HTTP
      if (!response.ok) {
        const errorText = await response.text(); // Intenta leer el texto del error
        console.error(
          `Error HTTP al cargar doctores: ${response.status} - ${errorText}`
        );
        alert(
          `Error al cargar los doctores: ${response.status}. ${errorText}. Por favor, intente de nuevo.`
        );
        return; // Importante: salir si hay un error HTTP
      }

      const doctores = await response.json();
      console.log("Doctores recibidos:", doctores); // Log para ver los datos recibidos

      if (doctores.length === 0) {
        doctorSelect.innerHTML =
          '<option value="">No hay doctores disponibles</option>';
        console.warn(
          `No se encontraron doctores para la especialidad ${idEspecialidad}.`
        );
        return;
      }

      doctores.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.nombre;
        doctorSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error en la función cargarDoctores:", error);
      alert(`Error al cargar los doctores: ${error.message}.`);
    }
  } else {
    console.log(
      "No se seleccionó una especialidad, reseteando lista de doctores."
    );
  }
}

// --- Habilitar/Deshabilitar botones de acción de cita (sin cambios) ---
function deshabilitarBotonesAccionCita() {
  document.getElementById("btnPagarCita").disabled = true;
  document.getElementById("btnCancelarCita").disabled = true;
}

function habilitarBotonesAccionCita() {
  document.getElementById("btnPagarCita").disabled = false;
  document.getElementById("btnCancelarCita").disabled = false;
}

// --- Manejo de selección de citas (checkboxes) (sin cambios) ---
function handleCitaSelection() {
  const checkboxes = document.querySelectorAll(".cita-checkbox");
  let selectedCount = 0;
  let selectedCitaId = null;
  let selectedCitaMonto = null;

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedCount++;
      selectedCitaId = checkbox.value;
      const row = checkbox.closest("tr");
      selectedCitaMonto = row.dataset.monto;
    }
  });

  if (selectedCount === 1) {
    habilitarBotonesAccionCita();
    document.getElementById("btnPagarCita").onclick = () =>
      modalPago(selectedCitaId, selectedCitaMonto || "0.00");
    document.getElementById("btnCancelarCita").onclick = () =>
      confirmarCancelacion(selectedCitaId);
  } else {
    deshabilitarBotonesAccionCita();
    document.getElementById("btnPagarCita").onclick = null;
    document.getElementById("btnCancelarCita").onclick = null;
  }
}

// --- Lógica para cargar Citas Pendientes (sin cambios) ---
async function cargarCitasPendientes() {
  const container = document.getElementById("citas_pendientes_container");
  container.innerHTML = "<p>Cargando citas...</p>";
  deshabilitarBotonesAccionCita();

  try {
    const response = await fetch("/api/citas_pendientes_json");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const citas = await response.json();

    if (citas.length === 0) {
      container.innerHTML =
        "<p>No tienes citas pendientes en este momento.</p>";
      return;
    }

    let htmlContent = `
            <table class="citas-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Doctor</th>
                        <th>Especialidad</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
        `;

    citas.forEach((cita) => {
      const montoCita = cita.monto || "50.00";
      htmlContent += `
                <tr data-monto="${montoCita}">
                    <td><input type="checkbox" class="cita-checkbox" value="${cita.id}" onchange="handleCitaSelection()"></td>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.doctor}</td>
                    <td>${cita.especialidad}</td>
                    <td>${cita.motivo}</td>
                </tr>
            `;
    });

    htmlContent += `
                </tbody>
            </table>
        `;
    container.innerHTML = htmlContent;

    document.querySelectorAll(".cita-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", handleCitaSelection);
    });
  } catch (error) {
    console.error("Error al cargar citas pendientes:", error);
    container.innerHTML = `<p>Error al cargar las citas: ${error.message}. Por favor, inténtalo de nuevo.</p>`;
  }
}

// --- NUEVA Lógica para cargar Historial de Citas ---
async function cargarHistorialCitas() {
  const container = document.getElementById("historial_citas_container");
  container.innerHTML = "<p>Cargando historial...</p>";

  try {
    const response = await fetch("api/historial_citas_json");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const citas = await response.json();

    if (citas.length === 0) {
      container.innerHTML =
        "<p>No hay citas en el historial (pagadas o canceladas).</p>";
      return;
    }

    let htmlContent = `
            <table class="citas-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Doctor</th>
                        <th>Especialidad</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;

    citas.forEach((cita) => {
      let estadoClase = "";
      // Opcional: añadir clases para estilizar el estado (verde para pagado, rojo para cancelado)
      if (cita.estado === "Pagada") {
        estadoClase = "estado-pagada";
      } else if (cita.estado === "Cancelada") {
        estadoClase = "estado-cancelada";
      }

      htmlContent += `
                <tr>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.doctor}</td>
                    <td>${cita.especialidad}</td>
                    <td>${cita.motivo}</td>
                    <td class="${estadoClase}"><strong>${cita.estado}</strong></td>
                </tr>
            `;
    });

    htmlContent += `
                </tbody>
            </table>
        `;
    container.innerHTML = htmlContent;
  } catch (error) {
    console.error("Error al cargar historial de citas:", error);
    container.innerHTML = `<p>Error al cargar el historial: ${error.message}. Por favor, inténtalo de nuevo.</p>`;
  }
}

// --- Confirmación de Cancelación (sin cambios) ---
async function confirmarCancelacion(citaId) {
  const seguro = confirm("¿Está seguro de que desea cancelar esta cita?");
  if (seguro) {
    try {
      const response = await fetch("/cancelar_cita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_cita: citaId }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Cita cancelada exitosamente.");
        closeModalCitasPendientes();
        cargarCitasPendientes();
      } else {
        alert(
          "Error al cancelar la cita: " +
            (result.message || "Un error desconocido ocurrió.")
        );
      }
    } catch (error) {
      console.error("Error en la solicitud de cancelación:", error);
      alert("Error al conectar con el servidor para cancelar la cita.");
    }
  }
}

// --- Envío del formulario de agendar (sin cambios) ---
document.addEventListener("DOMContentLoaded", () => {
  const formAgendar = document.getElementById("form_agendar");

  const especialidadSelect = document.getElementById("especialidad");
  if (especialidadSelect) {
    // Añadir el event listener UNA SOLA VEZ
    especialidadSelect.addEventListener("change", (event) => {
      cargarDoctores(event.target.value);
    });
  }

  if (formAgendar) {
    formAgendar.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fecha = document.getElementById("fecha").value;
      const hora = document.getElementById("hora").value;
      const motivo = document.getElementById("motivo").value;
      const id_doctor = document.getElementById("doctor").value;
      const id_especializacion = document.getElementById("especialidad").value;

      if (!fecha || !hora || !motivo || !id_doctor || !id_especializacion) {
        alert("Por favor, complete todos los campos requeridos.");
        return;
      }

      const data = {
        fecha: fecha,
        hora: hora,
        motivo: motivo,
        id_doctor: id_doctor,
        id_especializacion: id_especializacion,
      };

      try {
        const response = await fetch("/api/guardar_cita", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorResponse = await response
            .json()
            .catch(() => ({ message: "Error desconocido" }));
          console.error("Respuesta del servidor no OK:", errorResponse);
          alert(
            "Error del servidor: " +
              (errorResponse.message || "Ver consola para detalles.")
          );
          return;
        }

        const result = await response.json();
        if (result.success) {
          alert("Cita guardada exitosamente");
          closeModalAgendarCita();
          formAgendar.reset();
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error al conectar con el servidor");
      }
    });
  }

  // Lógica del formulario de pago
  const formPago = document.getElementById("form_pago");
  if (formPago) {
    formPago.addEventListener("submit", async function (e) {
      e.preventDefault();

      const citaId = formPago.dataset.citaId;
      const monto = document.getElementById("monto_pago").value;
      const metodoPago = document.getElementById("metodo_pago").value;

      if (metodoPago === "tarjeta") {
        const cardNumber = document.getElementById("card_number").value;
        const cardExpiry = document.getElementById("card_expiry").value;
        const cardCvv = document.getElementById("card_cvv").value;
        if (!cardNumber || !cardExpiry || !cardCvv) {
          alert("Por favor, complete todos los detalles de la tarjeta.");
          return;
        }
      }

      const data = {
        id_cita: citaId,
        monto: monto,
        metodo_pago: metodoPago,
      };

      try {
        const response = await fetch("/api/procesar_pago", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          alert(
            "Pago procesado exitosamente. La cita ha sido marcada como pagada."
          );
          closeModalPago();
          closeModalCitasPendientes();
          cargarCitasPendientes();

          // Redirigir al usuario a la URL que genera el PDF
          window.open(
            `/api/generar_factura_pdf/${result.id_cita_pagada}`,
            "_blank"
          ); // Usar el ID devuelto por el servidor
        } else {
          alert(
            "Error al procesar el pago: " +
              (result.message || "Un error desconocido ocurrió.")
          );
        }
      } catch (error) {
        console.error("Error en la solicitud de pago:", error);
        alert("Error al conectar con el servidor para procesar el pago.");
      }
    });

    const metodoPagoSelect = document.getElementById("metodo_pago");
    const cardDetailsDiv = document.getElementById("card_details");
    if (metodoPagoSelect && cardDetailsDiv) {
      metodoPagoSelect.addEventListener("change", () => {
        if (metodoPagoSelect.value === "tarjeta") {
          cardDetailsDiv.style.display = "block";
          cardDetailsDiv
            .querySelectorAll("input")
            .forEach((input) => input.setAttribute("required", "true"));
        } else {
          cardDetailsDiv.style.display = "none";
          cardDetailsDiv
            .querySelectorAll("input")
            .forEach((input) => input.removeAttribute("required"));
        }
      });
    }
  }
});

// Lógica del formulario de pago
const formPago = document.getElementById("form_pago");
if (formPago) {
  formPago.addEventListener("submit", async function (e) {
    e.preventDefault();

    const citaId = formPago.dataset.citaId;
    const monto = document.getElementById("monto_pago").value;
    const metodoPago = document.getElementById("metodo_pago").value;

    if (metodoPago === "tarjeta") {
      const cardNumber = document.getElementById("card_number").value;
      const cardExpiry = document.getElementById("card_expiry").value;
      const cardCvv = document.getElementById("card_cvv").value;
      if (!cardNumber || !cardExpiry || !cardCvv) {
        alert("Por favor, complete todos los detalles de la tarjeta.");
        return;
      }
    }

    const data = {
      id_cita: citaId,
      monto: monto,
      metodo_pago: metodoPago,
    };

    try {
      const response = await fetch("/procesar_pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          "Pago procesado exitosamente. La cita ha sido marcada como pagada."
        );
        closeModalPago();
        closeModalCitasPendientes();
        cargarCitasPendientes();
        cargarHistorialCitas(); // También recargar historial para ver la cita pagada

        // ¡NUEVO!: Generar y descargar la factura
        // Redirigir al usuario a la URL que genera el PDF
        window.open(`/api/generar_factura_pdf/${result.id_cita_pagada}`, "_blank");
      } else {
        alert(
          "Error al procesar el pago: " +
            (result.message || "Un error desconocido ocurrió.")
        );
      }
    } catch (error) {
      console.error("Error en la solicitud de pago:", error);
      alert("Error al conectar con el servidor para procesar el pago.");
    }
  });

  const formPago = document.getElementById("form_pago");
  if (formPago) {
    formPago.addEventListener("submit", async function (e) {
      e.preventDefault();

      const citaId = formPago.dataset.citaId;
      const monto = document.getElementById("monto_pago").value;
      const metodoPago = document.getElementById("metodo_pago").value;

      if (metodoPago === "tarjeta") {
        const cardNumber = document.getElementById("card_number").value;
        const cardExpiry = document.getElementById("card_expiry").value;
        const cardCvv = document.getElementById("card_cvv").value;
        if (!cardNumber || !cardExpiry || !cardCvv) {
          alert("Por favor, complete todos los detalles de la tarjeta.");
          return;
        }
      }

      const data = {
        id_cita: citaId,
        monto: monto,
        metodo_pago: metodoPago,
      };

      try {
        const response = await fetch("/procesar_pago", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          alert(
            "Pago procesado exitosamente. La cita ha sido marcada como pagada."
          );
          closeModalPago();
          closeModalCitasPendientes();
          cargarCitasPendientes();
          cargarHistorialCitas(); // También recargar historial para ver la cita pagada

          // ¡NUEVO!: Generar y descargar la factura
          // Redirigir al usuario a la URL que genera el PDF
          if (result.id_cita_pagada) {
            // Asegúrate de que el ID de la cita pagada esté presente
            window.open(
              `/api/generar_factura_pdf/${result.id_cita_pagada}`,
              "_blank"
            );
          } else {
            console.warn(
              "No se recibió el ID de la cita pagada para generar la factura."
            );
          }
        } else {
          alert(
            "Error al procesar el pago: " +
              (result.message || "Un error desconocido ocurrió.")
          );
        }
      } catch (error) {
        console.error("Error en la solicitud de pago:", error);
        alert("Error al conectar con el servidor para procesar el pago.");
      }
    });
  }
}
