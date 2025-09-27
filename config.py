# config.py
# إعدادات التطبيق

import os

# Database configuration
# NOTE: Replace with your actual MySQL credentials and database name
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'password'
MYSQL_HOST = 'localhost'
MYSQL_DB = 'time_tracker_db'

SQLALCHEMY_DATABASE_URI = f'mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Secret key for session management (optional for now)
SECRET_KEY = os.urandom(24)

