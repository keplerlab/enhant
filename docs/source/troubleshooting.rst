Tips and Troubleshooting
=================================


Error:- Docker container crashed
--------------------------------

If your node server crashes or docker goes down, please raise a issue on github with details.
To restart the application, open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose up

enhant will start again


Remove all Dangling Docker images
-----------------------------------

If you are using docker to build and manage enhant it may happen
that after running *docker-compose build* multiple times you may
start to run out of disk space.
To recover some of this disk space you can remove dangling docker images
using this command::
 
        docker rmi $(docker images -f 'dangling=true' -q)