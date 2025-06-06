from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app import db, bcrypt
from app.models import User, Especializacion, Doctor, Cita  
from flask_login import login_user, login_required, logout_user, current_user



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

    # Verificar que no esté vacío
    if not id_doctor:
        return jsonify({"success": False, "message": "Debe seleccionar un doctor."})

    nueva_cita = Cita(
        fecha=fecha,
        hora=hora,
        motivo=motivo,
        diagnostico='',
        tratamiento='',
        id_paciente=1,  # Suponiendo que estás usando login
        id_doctor=id_doctor,
        id_especializacion=id_especializacion
    )

    db.session.add(nueva_cita)
    db.session.commit()

    return jsonify({"success": True})