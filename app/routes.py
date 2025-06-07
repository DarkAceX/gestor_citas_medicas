import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, send_file 
from app import db, bcrypt
from app.models import User, Especializacion, Doctor, Cita, EstadoCita 
from flask_login import login_user, login_required, logout_user, current_user
from fpdf import FPDF, fpdf, enums
from fpdf.enums import Align, XPos, YPos
import io


main = Blueprint('main', __name__)

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Buscar el usuario en la base de datos
        user = User.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('main.dashboard'))
        else:
            flash("Correo o contraseña incorrectos.", "error")

    return render_template('login.html')

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/dashboard')
#@login_required  # Protege esta ruta para usuarios logueados
def dashboard():
    return render_template('dashboard.html')
    #return f"Bienvenido al dashboard" #{current_user.username}

@main.route('/logout')
#@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@main.route('/especialidades')
def obtener_especialidades():
    especialidades = Especializacion.query.all()
    data = [{"id": esp.id_especializacion, "nombre": esp.nombre} for esp in especialidades]
    return jsonify(data)

@main.route('/doctores/<int:id_especialidad>')
def obtener_doctores(id_especialidad):
    doctores = Doctor.query.filter_by(id_especializacion=id_especialidad).all()
    data = [
        {
            "id": doc.id_doctor,
            "nombre": f"{doc.nombre} {doc.apellido}"
        } for doc in doctores
    ]
    return jsonify(data)

@main.route('/guardar_cita', methods=['POST'])
def guardar_cita():
    data = request.get_json()

    fecha = data['fecha']
    hora = data['hora']
    motivo = data['motivo']
    id_doctor = data['id_doctor']  # <- Este valor debe estar en el JSON
    id_especializacion = data['id_especializacion']
    id_estado_cita = EstadoCita.query.get(0)

    if not id_estado_cita:
        flash("Error interno: El estado 'Pendiente' (ID 0) no se encuentra en la base de datos.", "danger")
        return jsonify({"success": False, "message": "Error al asignar estado de cita. Contacte al administrador."})

    nueva_cita = Cita(
        fecha=fecha,
        hora=hora,
        motivo=motivo,
        diagnostico='',
        tratamiento='',
        id_paciente=1,  
        id_doctor=id_doctor,
        id_especializacion=id_especializacion,
        id_estado_cita=id_estado_cita
    )

    db.session.add(nueva_cita)
    db.session.commit()

    return jsonify({"success": True})

@main.route('/citas_pendientes_json')
# @login_required # Deberías proteger esta ruta para que solo usuarios logueados puedan ver sus citas
def obtener_citas_pendientes_json():
    id_paciente_actual = 1 # **AJUSTAR**: usar current_user.id si el usuario está logueado

    citas_pendientes = Cita.query.filter_by(
        id_paciente=id_paciente_actual,
        id_estado_cita=0 # Filtra por el estado pendiente (ID 0)
    ).all()

    citas_data = []
    for cita in citas_pendientes:
        doctor_nombre_completo = "Doctor Desconocido"
        # Asegúrate de que 'doctor_rel' está definido en tu modelo Cita
        if cita.doctor_rel:
            doctor_nombre_completo = f"{cita.doctor_rel.nombre} {cita.doctor_rel.apellido}"
        
        especialidad_nombre = "Especialidad Desconocida"
        # Asegúrate de que 'especializacion_rel' está definido en tu modelo Cita
        if cita.especializacion_rel:
            especialidad_nombre = cita.especializacion_rel.nombre

        citas_data.append({
            "id": cita.id_cita,
            "fecha": cita.fecha.strftime('%Y-%m-%d'), # Formatear la fecha
            "hora": cita.hora.strftime('%H:%M'),     # Formatear la hora
            "motivo": cita.motivo,
            "doctor": doctor_nombre_completo,
            "especialidad": especialidad_nombre
        })
    
    return jsonify(citas_data)

#Procesar Pago de Cita
@main.route('/procesar_pago', methods=['POST'])
#@login_required
def procesar_pago():
    data = request.get_json()
    cita_id = data.get('id_cita')
    monto = data.get('monto')
    metodo_pago = data.get('metodo_pago')

    if not all([cita_id, monto, metodo_pago]):
        return jsonify({"success": False, "message": "Datos de pago incompletos."}), 400

    try:
        cita = Cita.query.get(cita_id)
        if not cita:
            return jsonify({"success": False, "message": "Cita no encontrada."}), 404
        
        # Validar que la cita pertenece al usuario logueado (seguridad)
        # if cita.id_paciente != current_user.id:
        #     return jsonify({"success": False, "message": "No autorizado para pagar esta cita."}), 403

        # Buscar el estado 'Pagado' (asumiendo id_estado_cita=1)
        estado_pagado = EstadoCita.query.filter_by(nombre='Pagada').first()
        if not estado_pagado:
            return jsonify({"success": False, "message": "Estado 'Pagada' no encontrado en la base de datos."}), 500

        # Cambiar el estado de la cita a "Pagado"
        cita.id_estado_cita = estado_pagado.id_estado_cita
        db.session.commit()

        # Aquí podrías añadir lógica para registrar la transacción de pago,
        # integrar con una pasarela de pago real (aunque no lo haremos aquí), etc.
        print(f"Cita {cita_id} pagada. Monto: {monto}, Método: {metodo_pago}")
        
        # MODIFICACIÓN AQUÍ: DEVOLVER EL ID DE LA CITA PAGADA
        return jsonify({"success": True, "message": "Pago procesado exitosamente.", "id_cita_pagada": cita.id_cita})

        return jsonify({"success": True, "message": "Pago procesado exitosamente."})

    except Exception as e:
        db.session.rollback()
        print(f"Error al procesar pago de cita {cita_id}: {e}")
        return jsonify({"success": False, "message": "Error interno del servidor al procesar el pago."}), 500

# NUEVA RUTA: Cancelar Cita
@main.route('/cancelar_cita', methods=['POST'])
#@login_required
def cancelar_cita():
    data = request.get_json()
    cita_id = data.get('id_cita')

    if not cita_id:
        return jsonify({"success": False, "message": "ID de cita no proporcionado."}), 400

    try:
        cita = Cita.query.get(cita_id)
        if not cita:
            return jsonify({"success": False, "message": "Cita no encontrada."}), 404
        
        # Validar que la cita pertenece al usuario logueado (seguridad)
        # if cita.id_paciente != current_user.id:
        #     return jsonify({"success": False, "message": "No autorizado para cancelar esta cita."}), 403

        # Buscar el estado 'Cancelada' (asumiendo id_estado_cita=2)
        estado_cancelado = EstadoCita.query.filter_by(nombre='Cancelada').first()
        if not estado_cancelado:
            return jsonify({"success": False, "message": "Estado 'Cancelada' no encontrado en la base de datos."}), 500

        # Cambiar el estado de la cita a "Cancelada"
        cita.id_estado_cita = estado_cancelado.id_estado_cita
        db.session.commit()

        return jsonify({"success": True, "message": "Cita cancelada exitosamente."})

    except Exception as e:
        db.session.rollback()
        print(f"Error al cancelar cita {cita_id}: {e}")
        return jsonify({"success": False, "message": "Error interno del servidor al cancelar la cita."}), 500
    
@main.route('/historial_citas_json')
#@login_required # Proteger esta ruta
def obtener_historial_citas_json():
    id_paciente_actual = 1

    # Obtener los IDs de los estados 'Pagada' y 'Cancelada'
    estado_pagada = EstadoCita.query.filter_by(nombre='Pagada').first()
    estado_cancelada = EstadoCita.query.filter_by(nombre='Cancelada').first()

    estado_ids_filtrar = []
    if estado_pagada:
        estado_ids_filtrar.append(estado_pagada.id_estado_cita)
    if estado_cancelada:
        estado_ids_filtrar.append(estado_cancelada.id_estado_cita)

    if not estado_ids_filtrar:
        return jsonify([]), 500 # Si no se encuentran los estados, devolver vacío o error

    historial_citas = Cita.query.filter(
        Cita.id_paciente == id_paciente_actual,
        Cita.id_estado_cita.in_(estado_ids_filtrar) # Filtrar por ambos estados
    ).order_by(Cita.fecha.desc(), Cita.hora.desc()).all() # Opcional: ordenar por fecha descendente

    citas_data = []
    for cita in historial_citas:
        doctor_nombre_completo = "Doctor Desconocido"
        if cita.doctor_rel:
            doctor_nombre_completo = f"{cita.doctor_rel.nombre} {cita.doctor_rel.apellido}"

        especialidad_nombre = "Especialidad Desconocida"
        if cita.especializacion_rel:
            especialidad_nombre = cita.especializacion_rel.nombre
        
        estado_nombre = "Desconocido"
        if cita.estado_cita_rel:
            estado_nombre = cita.estado_cita_rel.nombre


        citas_data.append({
            "id": cita.id_cita,
            "fecha": cita.fecha.strftime('%Y-%m-%d'),
            "hora": cita.hora.strftime('%H:%M'),
            "motivo": cita.motivo,
            "doctor": doctor_nombre_completo,
            "especialidad": especialidad_nombre,
            "estado": estado_nombre # Añadir el nombre del estado
        })
    
    return jsonify(citas_data)

@main.route('/generar_factura_pdf/<int:cita_id>')
# @login_required # Puedes proteger esta ruta si el PDF es solo para el paciente logueado
def generar_factura_pdf(cita_id):
    cita = Cita.query.get(cita_id)
    if not cita:
        flash("Cita no encontrada para generar la factura.", "error")
        return redirect(url_for('main.dashboard')) # O manejar el error de otra forma

     # Opcional: Verificar que el usuario logueado es el dueño de la cita
    # if cita.id_paciente != current_user.id:
    #     flash("No autorizado para ver esta factura.", "error")
    #     return redirect(url_for('main.dashboard'))

    # Preparar los datos de la factura
    fecha_emision = datetime.date.today().strftime('%Y-%m-%d')
    hora_emision = datetime.datetime.now().strftime('%H:%M:%S')

    # paciente_nombre = cita.paciente_rel.username if cita.paciente_rel else "N/A"
    doctor_nombre = f"{cita.doctor_rel.nombre} {cita.doctor_rel.apellido}" if cita.doctor_rel else "N/A"
    especialidad_nombre = cita.especializacion_rel.nombre if cita.especializacion_rel else "N/A"
    motivo_cita = cita.motivo
    fecha_cita = cita.fecha.strftime('%Y-%m-%d')
    hora_cita = cita.hora.strftime('%H:%M')
    estado_cita = cita.estado_cita_rel.nombre if cita.estado_cita_rel else "N/A"
    monto_pago = "50.00" # Asumimos un monto fijo o lo obtendrías de la cita si lo guardas

    # Crear el PDF
    pdf = FPDF()
    pdf.add_page()

    # Configurar fuente
    pdf.set_font("Arial", size=12)

    # Título de la factura
    pdf.set_font("Arial", 'B', 20)
    pdf.cell(0, 10, "FACTURA DE SERVICIOS MÉDICOS", 0, 1, 'C')
    pdf.ln(10)

    # Información de la clínica (puedes personalizarla)
    pdf.set_font("Arial", '', 10)
    pdf.cell(0, 5, "Clínica Salud Total", 0, 1, 'C')
    pdf.cell(0, 5, "Av. Siempre Viva 123, Ciudad Ejemplo", 0, 1, 'C')
    pdf.cell(0, 5, "Teléfono: (593) 987-6543 | Email: info@saludtotal.com", 0, 1, 'C')
    pdf.ln(10)

    # Detalles de la factura
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 7, f"Factura No.: {cita.id_cita:06d}", 0, 1, 'L') # Formato 00000X
    pdf.cell(0, 7, f"Fecha de Emisión: {fecha_emision}", 0, 1, 'L')
    pdf.cell(0, 7, f"Hora de Emisión: {hora_emision}", 0, 1, 'L')
    pdf.ln(5)

    # Detalles del Paciente
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 7, "Detalles del Paciente:", 0, 1, 'L')
    pdf.set_font("Arial", '', 11)
    pdf.cell(0, 7, f"Nombre: Pruebas", 0, 1, 'L')  #{paciente_nombre}
    pdf.ln(5)

    # Detalles de la Cita
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 7, "Detalles de la Cita:", 0, 1, 'L')
    pdf.set_font("Arial", '', 11)
    pdf.cell(0, 7, f"Doctor: {doctor_nombre}", 0, 1, 'L')
    pdf.cell(0, 7, f"Especialidad: {especialidad_nombre}", 0, 1, 'L')
    pdf.cell(0, 7, f"Fecha de Cita: {fecha_cita}", 0, 1, 'L')
    pdf.cell(0, 7, f"Hora de Cita: {hora_cita}", 0, 1, 'L')
    pdf.multi_cell(0, 7, f"Motivo de Cita: {motivo_cita}") # multi_cell para texto largo
    pdf.ln(5)

    # Resumen de Costos
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 7, "Resumen de Costos:", 0, 1, 'L')
    pdf.set_font("Arial", '', 11)
    pdf.cell(100, 7, "Descripción", 1, 0, 'C')
    pdf.cell(50, 7, "Monto", 1, 1, 'C')

    pdf.cell(100, 7, "Consulta Médica", 1, 0, 'L')
    pdf.cell(50, 7, f"${monto_pago}", 1, 1, 'R')

    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 7, "TOTAL A PAGAR", 1, 0, 'L')
    pdf.cell(50, 7, f"${monto_pago}", 1, 1, 'R')
    pdf.ln(10)

    # Pie de página
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(0, 5, "Gracias por su confianza en Clínica Salud Total.", 0, 1, 'C')
    pdf.cell(0, 5, "Este es un documento generado automáticamente. No requiere firma.", 0, 1, 'C')

    # Guardar el PDF en un buffer de memoria
    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0) # Volver al inicio del buffer

    # Enviar el PDF como archivo
    return send_file(
        pdf_output,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'factura_cita_{cita.id_cita}.pdf'
    )