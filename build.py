from pybuilder.core import use_plugin,init

use_plugin("python.core")
use_plugin("python.frosted")
use_plugin("python.flake8")

default_task = "analyze"

@init
def initialize(project):
  project.verison = "0.1"

  project.set_property("dir_source_main_scripts", "timecontrol/")

  project.set_property("frosted_include_scripts", True)

  project.set_property("flake8_include_scripts", True)
