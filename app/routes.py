from flask import Blueprint, render_template, request, redirect, url_for, flash
from app import db, bcrypt
from app.models import User
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
@login_required  # Protege esta ruta para usuarios logueados
def dashboard():
    return f"Bienvenido al dashboard, {current_user.username}"

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))
