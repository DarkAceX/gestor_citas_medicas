from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app import db, bcrypt
from app.models import Paciente
from flask_login import login_user, login_required, logout_user, current_user

main = Blueprint('main', __name__, url_prefix='/api')

@main.route('/login', methods=['POST'])
def login():
    # Lógica para el login API (espera JSON del frontend)
    data = request.get_json()
    correo = data.get('username') # El frontend envía 'username', lo usamos como correo
    password = data.get('password')

    if not correo or not password:
        return jsonify({'message': 'Faltan correo/usuario o contraseña'}), 400

    # Buscar al paciente por correo
    paciente = Paciente.query.filter_by(correo=correo).first()

    # Verificar la contraseña
    if paciente and paciente.check_password(password):
        login_user(paciente)
        # Devolver una respuesta JSON indicando éxito y posiblemente una URL de redirección
        # La redirección ahora apuntará a la ruta de dashboard sin prefijo /api
        return jsonify({'message': 'Inicio de sesión exitoso', 'redirect': url_for('render_dashboard_page', _external=True)}), 200 # Cambiar a render_dashboard_page
    else:
        # No dar detalles específicos si es correo o contraseña incorrecta por seguridad
        return jsonify({'message': 'Correo o contraseña incorrectos'}), 401

@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    nombre = data.get('nombre')
    apellido = data.get('apellido')
    correo = data.get('correo')
    telefono = data.get('telefono')
    password = data.get('password')

    if not nombre or not apellido or not correo or not password:
        return jsonify({'message': 'Faltan campos obligatorios'}), 400

    if Paciente.query.filter_by(correo=correo).first():
        return jsonify({'message': 'El correo electrónico ya está registrado'}), 409

    nuevo_paciente = Paciente(
        nombre=nombre,
        apellido=apellido,
        correo=correo,
        telefono=telefono
    )
    nuevo_paciente.set_password(password)

    try:
        db.session.add(nuevo_paciente)
        db.session.commit()
        return jsonify({'message': 'Paciente registrado exitosamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al registrar el paciente', 'error': str(e)}), 500

@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('render_login_page', _external=True))

@main.route('/reset_password_simple', methods=['POST'])
def reset_password_simple():
    data = request.get_json()
    correo = data.get('correo') # O podría ser username
    new_password = data.get('password')
    confirm_password = data.get('confirm_password')

    # Validaciones básicas
    if not correo or not new_password or not confirm_password:
        return jsonify({'message': 'Faltan campos obligatorios (correo/usuario, nueva contraseña, confirmación).'}), 400

    if new_password != confirm_password:
        return jsonify({'message': 'La nueva contraseña y su confirmación no coinciden.'}), 400

    # Buscar al paciente por correo (o usuario)
    paciente = Paciente.query.filter_by(correo=correo).first()

    if not paciente:
        # No informar si el correo no existe por seguridad
        return jsonify({'message': 'Si tu correo/usuario está registrado, la contraseña será actualizada.'}), 200 # Mensaje genérico por seguridad

    # Actualizar la contraseña (la función set_password la hashea)
    paciente.set_password(new_password)

    try:
        db.session.commit()
        return jsonify({'message': 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la contraseña.', 'error': str(e)}), 500
