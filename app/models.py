from app import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'


class Especializacion(db.Model):
    __tablename__ = 'especializacion'
    id_especializacion = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    
class Doctor(db.Model):
    __tablename__ = 'doctor'

    id_doctor = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), nullable=False, unique=True)
    telefono = db.Column(db.String(20), nullable=False)
    id_especializacion = db.Column(db.Integer, db.ForeignKey('especializacion.id_especializacion'), nullable=False)

    especializacion = db.relationship('Especializacion', backref='doctores')

    def __repr__(self):
        return f"<Doctor {self.nombre} {self.apellido}>"

class Cita(db.Model):
    __tablename__ = 'cita'
    id_cita = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    motivo = db.Column(db.String(255), nullable=False)
    diagnostico = db.Column(db.String(255))
    tratamiento = db.Column(db.String(255))
    id_paciente = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    id_doctor = db.Column(db.Integer, db.ForeignKey('doctor.id_doctor'), nullable=False)
    id_especializacion = db.Column(db.Integer, db.ForeignKey('especializacion.id_especializacion'), nullable=False)