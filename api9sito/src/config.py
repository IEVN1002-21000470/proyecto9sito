# config.py
class Config:
    SECRET_KEY = 'B!1w8NAt1T^%kvhUI*S^' # Cambia esto por una clave segura random

class DevelopmentConfig(Config):
    DEBUG = True
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'      # Usuario por defecto de XAMPP
    MYSQL_PASSWORD = ''      # XAMPP por defecto no tiene contraseña
    MYSQL_DB = '9sito'
    MYSQL_PORT = 3305

config = {
    'development': DevelopmentConfig
}
