from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class Paciente(UserMixin, db.Model):
    __tablename__ = 'Paciente' # Asegurarse de que el nombre de la tabla coincida con el SQL

    id_paciente = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    telefono = db.Column(db.String(20))
    password_hash = db.Column(db.String(200), nullable=False) # Campo para la contraseña hasheada

    # Métodos para manejar la contraseña
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Método requerido por UserMixin para obtener el ID de usuario
    def get_id(self):
        return str(self.id_paciente)

    def __repr__(self):
        return f'<Paciente {self.correo}>'


