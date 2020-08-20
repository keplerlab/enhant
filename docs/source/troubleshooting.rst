Tips and Troubleshooting
=================================

Error:- Listen tcp 0.0.0.0:1813: bind: address already in use
-------------------------------------------------------------

If you encounter this error, the port 1813 is already in use by some other application. You can either
free the port or run the docker application on some other port.

**How to release port in use**

To release port 1813 on your linux/Mac machine:

Open terminal and run the following commands::

        lsof -i:1813 // to list the application using the port

        kill $(lsof -t -i:1813) // to kill application on that port

        OR

        kill -9 $(lsof -t -i:1813) // to kill violently


**How to run docker on another port**

To run idea2life docker on another port, do the following:

1. Goto idea2life repo root
2. Open *docker-compose.yml* file
3. Under idea2life, change ports mapping configuration from *1813:1813* to *yourPort:1813*. (yourPort is the port where you want to access the application)
4. Save the file.

Open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose build

        docker-compose up

enhant is now accessible on the port you entered.


Error:- Docker container crashed
--------------------------------

If your node server crashes or docker goes down, please raise a issue on github with details.
To restart the application, open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose up

enhant will start again

Error:- Link between 2 pages is broken, when a page is renamed
------------------------------------------------------------------------------------------------


If you rename a page then the mapping URL to the page also changes, hence the link between the pages is broken.
For fixing this, please go back to the editor and remap the link URL for the corresponding page and save.
Now the link should work properly.



Remove all Dangling Docker images
-----------------------------------

If you are using docker to build and manage enhant it may happen
that after running *docker-compose build* multiple times you may
start to run out of disk space.
To recover some of this disk space you can remove dangling docker images
using this command::
 
        docker rmi $(docker images -f 'dangling=true' -q)