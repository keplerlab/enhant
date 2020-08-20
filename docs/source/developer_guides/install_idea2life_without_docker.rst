
.. _idea2life_install_from_source:

Install and use enhant from source (without docker)
=======================================================

Currently we have tested enhant installation on MacOSX
and Linux systems only. These instructions assumes you have anaconda python
with python version 3.7 already installed on your system.

1) Clone enhant repo.

2) Create folder `ai/lib`. Install `PyYolo <https://github.com/keplerlab/pyyolo.git>`_ inside it. Follow instructions for installation of pyyolo by reading Readme file in pyyolo repo.

3) Inside folder `ai/models` download the `model file <https://drive.google.com/file/d/1bE0alaHVfnEjzqhj3EYMzB2RQOscDYdO/view?usp=sharing>`_ inside it.


4) Install dependencies **opencv** and **numpy** using either pip or conda.
For installing OpenCV on Ubuntu 16.04 and MacOSX use this command on your terminal::

    conda install --channel menpo opencv


5) Go inside the ai folder and run these two commands::

    cp cfg/yolo-obj.cfg lib/pyyolo/darknet/cfg/
    cp data/obj.names lib/pyyolo/darknet/data/

6) Goto folder  `idea2life`. Run npm install::

    cd <path_to_repo>/idea2life
    npm install

**Run Service**

You have to run ai service and main enhant service separately using this command.

1) Open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder
        export FLASK_APP=ai/server/app.py && flask run -p 5000


2) Inside file <path-to-repo>/idea2life/conf.js find this entry::

    ai: {
            url: 'ai',
            name: 'ai',
            port: 5000
        }

Replace field url: **ai** with localhost or ip of address server where ai service is hosted.

2) Open terminal and run the following commands::

        cd <path-to-repo>/idea2life //you need to be in your repo folder
        npm start

