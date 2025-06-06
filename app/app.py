from flask_login import LoginManager
from app.models import Paciente

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return Paciente.query.get(int(user_id))
