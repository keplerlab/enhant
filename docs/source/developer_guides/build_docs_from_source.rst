
How to build documentation from source
======================================

**Build documentation using docker**


You can use AI service container created
using docker-compose to additionally build documentation for you.

#. If not already started, start docker service from terminal using the following commands::

        cd <path-to-repo> //you need to be in your repo folder
        docker-compose up

#. Attach to AI service container instance::

        docker exec -i -t idea2life_open_ai_1 /bin/bash

#. Goto Docs directory in running container::

        cd ../docs/

#. Make documentation using command::

        make html

#. If no error this will build docs in folder docs/build/ in host system.
Open index.html for reading documentation


**Build documentation alternate instructions**


1) Install OpenCV in Anaconda python (python=3.7) ::

        conda install --channel menpo opencv

2) Install these dependencies from pip::

        npm install -g jsdoc
        pip install sphinx-js
        pip install sphinx
        pip install sphinx-rtd-theme

3) Goto directory docs::

        cd docs/

4) Issue command::

        make html


5) If no error this will build docs in folder docs/build/
open index.html using this from command prompt::

        open docs/build/index.html
