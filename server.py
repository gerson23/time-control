from flask import Flask, send_from_directory, request
from flask.ext.pymongo import PyMongo
from flask.ext.api import status
from pymongo.errors import DuplicateKeyError
import os

app = Flask(__name__, static_folder="assets")
mongo = PyMongo(app)

SERVER_PATH = os.getcwd()
STATIC_DIR = os.path.join(SERVER_PATH, "assets")
HTML_DIR = os.path.join(STATIC_DIR, "html")
JS_DIR = os.path.join(STATIC_DIR, "js")
CSS_DIR = os.path.join(STATIC_DIR, "css")

# STATIC FILES HANDLING
@app.route("/")
def index():
  return send_from_directory(HTML_DIR, "index.html")

@app.route('/js/<path:path>')
def send_js(path=None):
  return send_from_directory(JS_DIR, path)

@app.route('/css/<path:path>')
def send_css(path=None):
  return send_from_directory(CSS_DIR, path)

# FUNCTION HANDLING
@app.route("/login", methods=['POST'])
def login():
  req_json = request.get_json()
  user = req_json["username"]
  pswd = req_json["password"]
  results = mongo.db.users.find({'username': user, 'password': pswd})
  if results.count() == 1:
    return "Found..."
  else:
    return "Some problem", status.HTTP_400_BAD_REQUEST

@app.route("/login", methods=['GET'])
def login_get():
  mongo.db.users.insert_one({'username': 'test', "password": 'test123'})
  return "Done!"

@app.route("/add")
def add():
  mongo.db.users.create_index("username", unique=True)
  try:
    mongo.db.users.insert_one({'username': 'test', "password": 'test123'})
  except DuplicateKeyError:
    pass
  return "See!"

if __name__ == "__main__":
  app.run(debug=True)
