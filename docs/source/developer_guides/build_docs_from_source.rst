
How to build documentation from source
=======================================

**Build documentation using docker**

1. open cli::

        cd /path/to/enahant-repo
        docker-compose run cli


2. Goto docs folder::


        cd ../docs


3. Issue build command::


        make html


Please note Documentation will be available outside container at path **enhant-repo/docs/build/html** folder