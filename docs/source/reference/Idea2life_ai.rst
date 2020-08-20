enhant AI Service
******************************************

Idea2life AI Service is implemented at **/ai** in python language.
It is further divided into two separate modules.

First one is server module with main **Flask application** located
at **/ai/server** path in repo.
Second one is **template_detect module** located at  **/ai/template_detect**
in repo. Details of these could be find in reference below.

Main Flask application server.app
----------------------------------

.. automodule:: server.app
   :members:
   :undoc-members:
   :show-inheritance:
   :noindex:

template_detect module
----------------------------------------

**template_detect.template_detect** File inside template_detect module has
implementation of object detection code, It receives image from main
flask application with path for pre-trained model file and
cfg file and in turn calls pyyolo library for object detection.

.. automodule:: template_detect.template_detect
   :members:
   :undoc-members:
   :show-inheritance:
   :noindex:


**template_detect.utils** File inside template_detect module has
implementation of implementation of most of the helper class to be
used by template_detect.template_detect methods.

.. automodule:: template_detect.utils
   :members:
   :undoc-members:
   :show-inheritance:
   :noindex:
