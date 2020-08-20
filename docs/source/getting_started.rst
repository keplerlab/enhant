.. _idea2life_getting_started:

###############################
enhant Getting Started Guide
###############################



Installation
==============

**Install Using Docker**

#. Download and Install Docker Desktop for Mac using this
   link `docker-desktop <https://www.docker.com/products/docker-desktop>`_.
   and for linux using this link
   `docker-desktop on linux <https://docs.docker.com/install/linux/docker-ce/ubuntu/>`_

#.  Clone repo using this link
    `enhant repo <https://github.com/keplerlab/enhant.git>`_

#.  Change your directory to your cloned repo.


#. Start Docker containers::

        cd /path/to/enahant-repo/
        docker-compose up


#. Invoke cli for conversation id (111 in example below)::


        cd /path/to/enahant-repo
        docker-compose run cli
        python  main.py analyze 111 




Supported Hardware and operating system
========================================

enhant software is supported on the following host operating systems:

* Linux
* mac OS X


**Minimum system configuration.**:

* Processor: Dual core Processor
* RAM: 4GB of system memory
* Hard disk space: 10 GB
* Google Chrome or chromium browser

**Recommended system configuration**:

* Processor: Intel core i7 or higher
* RAM: 8GB of system memory
* Hard disk space: 30 GB



How to start or stop enhant
==============================

**Start**

1. Open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose up


**Stop**

2. Open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose down




How to use enhant
====================