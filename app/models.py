from app import db
from flask_login import UserMixin
from datetime import datetime, date, time 

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

    especializacion_rel = db.relationship('Especializacion', backref='doctores_rel')

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
    id_estado_cita = db.Column(db.Integer, db.ForeignKey('estado_cita.id_estado_cita'), nullable=False)

    # Definir las relaciones para acceder a los objetos relacionados desde Cita
    paciente_rel = db.relationship('User', foreign_keys=[id_paciente], backref='citas_paciente')
    doctor_rel = db.relationship('Doctor', foreign_keys=[id_doctor], backref='citas_doctor')
    especializacion_rel = db.relationship('Especializacion', foreign_keys=[id_especializacion], backref='citas_especializacion')
    estado_cita_rel = db.relationship('EstadoCita', foreign_keys=[id_estado_cita], backref='citas_estado')


    def __repr__(self):
        return f'<Cita {self.id_cita} - {self.fecha}>'

class EstadoCita(db.Model):
    __tablename__ = 'estado_cita'
    id_estado_cita = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False, unique=True) # Ej: 'Pendiente', 'Pagada', 'Cancelada'

    def __repr__(self):
        return f'<EstadoCita {self.nombre}>'