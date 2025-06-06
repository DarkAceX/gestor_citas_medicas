function modalAgendarCitas() {
    document.getElementById("modal_agendarCita").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal_agendarCita").classList.add("hidden");
}

// Cerrar modal si haces clic fuera del contenido
window.addEventListener("click", function (e) {
    const modal = document.getElementById("modal_agendarCita");
    if (e.target === modal) {
        closeModal();
    }
});

// Cargar especialidades al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch('/especialidades')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('especialidad');
            data.forEach(especialidad => {
                const option = document.createElement('option');
                option.value = especialidad.id;
                option.textContent = especialidad.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar especialidades:', error));
});

// Cargar doctores según especialidad
document.addEventListener('DOMContentLoaded', () => {
    const especialidadSelect = document.getElementById('especialidad');
    const doctorSelect = document.getElementById('doctor');

    especialidadSelect.addEventListener('change', () => {
        const idEspecialidad = especialidadSelect.value;

        doctorSelect.innerHTML = '<option value="">Seleccione un doctor</option>';

        if (idEspecialidad) {
            fetch(`/doctores/${idEspecialidad}`)
                .then(response => response.json())
                .then(doctores => {
                    doctores.forEach(doc => {
                        const option = document.createElement('option');
                        option.value = doc.id;
                        option.textContent = doc.nombre;
                        doctorSelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Error al cargar doctores:', error));
        }
    });
});

// Enviar formulario para agendar cita
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form_agendar");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fecha = document.getElementById("fecha").value;
            const hora = document.getElementById("hora").value;
            const motivo = document.getElementById("motivo").value;
            const doctor = document.getElementById("doctor").value;
            const especialidad = document.getElementById("especialidad").value;

            const data = {
                fecha: fecha,
                hora: hora,
                motivo: motivo,
                id_doctor: doctor,
                id_especializacion: especialidad
            };

            try {
                const response = await fetch("/guardar_cita", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const text = await response.text(); // Captura HTML si vino error
                    console.error("Respuesta del servidor no OK:", text);
                    alert("Error del servidor. Ver consola para detalles.");
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    alert("Cita guardada exitosamente");
                    closeModal();
                    form.reset();
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                alert("Error al conectar con el servidor");
            }

        });
    }
});
