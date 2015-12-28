# Time Control
I's a platform for time management of employees and managers.

# Current Build Status
[![Build Status](https://travis-ci.org/gerson23/time-control.svg)](https://travis-ci.org/gerson23/time-control)

# Requirements
Requirements for running the system:
* Python 2.7.x
* Flask
* Flask-API
* Flask-PyMongo
* MongoDB 3.x

Flask and Flask-PyMongo can be installed via pip:
```
pip install <module>
```

# Install
The installation is pretty straightforward:

1. Install all requirements
2. Start MongoDB' deamon
3. Add the initial user to users collection on mongo:
  ```
  db.users.insert({'username': 'darth', 'password': 'vader'})
  ```
4. Download and extract this project
5. Start the server:
  ```
  python server.py
  ```

  The platform shoud be available at `http://localhost:5000`

# License
Create by Gerson Carlos. Code available under [the MIT license](https://github.com/gerson23/time-control/blob/master/LICENSE).
