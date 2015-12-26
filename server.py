from flask import Flask, send_from_directory, request
from flask.ext.pymongo import PyMongo
from flask.ext.api import status
from flask import json
from pymongo.errors import DuplicateKeyError
import os

app = Flask(__name__, static_folder="assets")
mongo = PyMongo(app)

# STATIC PATHS
SERVER_PATH = os.getcwd()
STATIC_DIR = os.path.join(SERVER_PATH, "assets")
HTML_DIR = os.path.join(STATIC_DIR, "html")
JS_DIR = os.path.join(STATIC_DIR, "js")
CSS_DIR = os.path.join(STATIC_DIR, "css")

# APP CONSTANTS
INVALID_PROJECT = {'success': 'false', 'project': 1}
INVALID_USERNAME = {'success': 'false', 'username': 1}
DEFAULT_PASSWORD = "timecontrol"

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

@app.route('/view/<path:path>')
def send_html(path=None):
  return send_from_directory(HTML_DIR, path)

# FUNCTIONALITY HANDLING
@app.route("/login", methods=['POST'])
def login():
  """
  Verifies if the given user/password combo is valid on database.

  Returns: A JSON with the user profile in case of success. HTTP 400
  code in case of failure.
  """
  req_json = request.get_json()
  user = req_json["username"]
  pswd = req_json["password"]
  results = mongo.db.users.find({'username': user, 'password': pswd})
  if results.count() == 1:
    user_doc = results[0]
    return json.dumps(user_doc['profile'])
  else:
    return "", status.HTTP_400_BAD_REQUEST

@app.route("/user/add", methods=['POST'])
def user_add():
  req_json = request.get_json()

  # Get user variables
  name = req_json['name']
  username = req_json['username']
  password = DEFAULT_PASSWORD
  register = req_json['register']
  project = req_json['project']
  role = req_json['role']
  level = req_json['level']

  # Check whether project exits
  results = mongo.db.projects.find({'name': project})
  if results.count() == 0:
    return json.dumps(INVALID_PROJECT), status.HTTP_400_BAD_REQUEST

  try:
    result = mongo.db.users.insert_one({'username': username,
                                        'password': password,
                                        'profile': {
                                          'name': name,
                                          'register': register,
                                          'project': project,
                                          'role': role,
                                          'level': level}})
  except DuplicateKeyError:
    return json.dumps(INVALID_USERNAME), status.HTTP_400_BAD_REQUEST
  else:
    return ""

@app.route("/add")
def add():
  mongo.db.users.create_index("username", unique=True)
  try:
    mongo.db.users.insert_one({'username': 'test', "password": 'test123'})
  except DuplicateKeyError:
    pass
  return "See!"

if __name__ == "__main__":
  app.config.update(SEND_FILE_MAX_AGE_DEFAULT=0)
  app.run(debug=True)
