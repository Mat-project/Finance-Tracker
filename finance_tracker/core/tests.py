from django.test import TestCase
from django.db import connections
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand

# Create your tests here.

def test_db_connection():
    try:
        db_conn = connections['default']
        db_conn.cursor()
        print("Database connection was successful")
        return True
    except OperationalError:
        print("Database connection failed")
        return False
