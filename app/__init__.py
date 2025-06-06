from flask import Flask, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config
from flask_login import LoginManager, login_required

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'render_login_page'
login_manager.login_message_category = 'info'

# Ahora es seguro importar módulos que usan db, bcrypt, etc.
from app.models import Paciente

# User loader function for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    # Flask-Login passes the user_id as a string, so convert it to int
    return Paciente.query.get(int(user_id))

def create_app(config_class=Config):
    app = Flask(__name__,
                static_folder='static',
                template_folder='templates')

    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # Definir la ruta GET para la página de login
    @app.route('/login', methods=['GET'])
    def render_login_page():
        return render_template('login.html')

    # Definir la ruta GET para la página principal
    @app.route('/', methods=['GET'])
    def render_index_page():
        return render_template('index.html')

    # Definir la ruta GET para la página del dashboard, protegida con @login_required
    @app.route('/dashboard', methods=['GET'])
    @login_required
    def render_dashboard_page():
        return render_template('dashboard.html')

    # Nueva ruta para la página de restablecimiento de contraseña con token (GET)
    # @app.route('/reset_password/<token>', methods=['GET'])
    # def render_reset_token_page(token):
    #    ...

    # Importar blueprints aquí para evitar importaciones circulares
    from app.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
