import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

class Config:
    # Configuración de la base de datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:@localhost/citas_medicas'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de la clave secreta para Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'mi_clave_secreta'  # Debería ser reemplazada con una clave segura en producción



