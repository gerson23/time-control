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
INVALID_PROJECT = {'success': False, 'project': 1}
INVALID_USERNAME = {'success': False, 'username': 1}
MODIFIED_ENTRY = {'modified': True}
NOT_MODIFIED_ENTRY = {'modified': False}
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
    """
    Adds a new user to the database. It checes wheter the project is a valid one.
    As username is a unique key on database scheme, it checks for
    DuplicateKeyError exception.
    """
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
        mongo.db.users.insert_one({
            'username': username,
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


@app.route("/user/get", methods=['POST'])
def user_get():
    """
    Get an user given its register number.

    Returns: A JSON object with the user information.
    """
    req_json = request.get_json()

    result = mongo.db.users.find({'profile.register': req_json['register']})
    if result.count() == 0:
        return "", status.HTTP_400_BAD_REQUEST
    elif result.count() == 1:
        response = {'username': result[0]['username']}
        response['profile'] = result[0]['profile']
        return json.dumps(response)


@app.route("/user/delete", methods=['POST'])
def user_delete():
    """
    Deletes a user given its username.
    """
    req_json = request.get_json()

    result = mongo.db.users.delete_one(req_json)
    if result.deleted_count == 1:
        return ""
    else:
        return "", status.HTTP_400_BAD_REQUEST


@app.route("/user/update", methods=['POST'])
def user_update():
    """
    Updates an user profile given its username.

    Returns: a JSON with modified property in case of success.
    """
    req_json = request.get_json()

    result = mongo.db.users.update_one({'username': req_json['username']},
                                       {'$set': {
                                        'profile.name': req_json['name'],
                                        'profile.project': req_json['project'],
                                        'profile.role': req_json['role'],
                                        'profile.level': req_json['level']}})

    if result.matched_count == 1:
        if result.modified_count == 1:
            return json.dumps(MODIFIED_ENTRY)
        else:
            return json.dumps(NOT_MODIFIED_ENTRY)
    else:
        return "", status.HTTP_400_BAD_REQUEST


@app.route("/user/psw", methods=['POST'])
def user_password():
    req_json = request.get_json()

    result = mongo.db.users.find({'username': req_json['username'],
                                  'password': req_json['oldpass']})
    if result.count() != 1:
        return "", status.HTTP_400_BAD_REQUEST

    result = mongo.db.users.update_one({'username': req_json['username']},
                                       {'$set': {
                                        'password': req_json['newpass']}})

    if result.matched_count == 1:
        return ""
    else:
        return "", status.HTTP_400_BAD_REQUEST


@app.route("/project/get", methods=['POST'])
def project_get():
    """
    Gets a project or a set of projects.

    Returns: a JSON with an array of projects
    """
    req_json = request.get_json()

    return_dict = {'projects':  []}
    result = mongo.db.projects.find(req_json)
    for doc in result:
        return_dict['projects'].append(doc['name'])

    return json.dumps(return_dict)


@app.route("/project/add", methods=['POST'])
def project_add():
    """
    Adds a new project to the database.
    """
    req_json = request.get_json()

    try:
        mongo.db.projects.insert_one({'name': req_json['name']})
    except DuplicateKeyError:
        return "", status.HTTP_400_BAD_REQUEST
    else:
        return ""


@app.route("/project/delete", methods=['POST'])
def project_delete():
    """
    Deletes a project given its name.
    """
    req_json = request.get_json()

    result = mongo.db.projects.delete_one({'name': req_json['name']})
    if result.deleted_count == 1:
        return ""
    else:
        return "", status.HTTP_400_BAD_REQUEST


@app.route("/add")
def add():
    mongo.db.projects.create_index("name", unique=True)
    try:
        mongo.db.users.insert_one({'username': 'test', "password": 'test123'})
    except DuplicateKeyError:
        pass
    return "See!"

if __name__ == "__main__":
    app.config.update(SEND_FILE_MAX_AGE_DEFAULT=0)
    app.run(debug=True)
