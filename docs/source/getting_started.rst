.. _idea2life_getting_started:

###############################
enhant Getting Started Guide
###############################

Installation
==============

Chrome Extension
-----------------

The Chrome extension is the minimal requirement for most users to leverage enhan(t). The easiest way to install it is via the Chrome store.



To install the enhan(t) extension::
''''''''''''''''''''''''''''''''''''''''''''''''

#.  Navigate to Chrome Webstore via your Chrome browser. Chrome store screenshot
#.  Click the ‘Add to Chrome’ button. You would be able to see the enhan(t) icon in your toolbar.
#.  When you open a Zoom, MS Teams or Jitsi meeting, you will find the enhan(t) toolbar on the top right of your tab. <Toolbar screenshot>

Settings::
''''''''''''''''

For Basic mode users, you can leave the settings alone.::


        <Show settings screenshot>



For Power mode users, you need to install and run the companion Docker application (installation guide here <link to the installation guide>) and then check the ‘Enable Power Mode’ checkbox and hit ‘Apply’. A lightning icon will now appear in the toolbar once the record icon is pressed. The lightning icon can be used to show the real-time engagement and sentiment.


For advanced developers, who want to change ports during local deployment or host the Docker application remotely, the ‘Server’ textbox can be used to input the URL. Hit ‘Apply’ to persist the changes.


Transcription Service and CLI (Command Line Interface)
The transcription service and CLI enables the Power mode in the Chrome extension to work. It enables guest side transcription, provides engagement, sentiment and interrogatives.
The transcription service and CLI can be installed as a Docker compose application.
To install both as application using docker application follow these instructions:

#.  Make sure you have Docker installed on your system. If not,follow the instructions there to get started with Docker. link `docker-desktop <https://www.docker.com/products/docker-desktop>`_. and for linux using this link `docker-desktop on linux <https://docs.docker.com/install/linux/docker-ce/ubuntu/>`_

#.  Make sure you have Git installed. If not, go to https://www.atlassian.com/git/tutorials/install-git and follow the instructions there.

#.  You can find the enhan(t) project on Github at https://github.com/keplerlab/enhant. Clone the repository by running the following git clone command on your terminal::


        git clone https://github.com/keplerlab/enhant.git

    On **Windows** to prevent line ending issues clone using this command instead::


        git clone  https://github.com/keplerlab/enhant.git --config core.autocrlf=false



#.  Next, to have locally trusted development certificates we need to install mkcert. Please follow the installation instructions for your particular OS at  <https://github.com/FiloSottile/mkcert> .
#.  Now go to the cloned ‘enhant’ directory and then run ‘cd certificates’.
#.  Run ‘mkcert localhost 127.0.0.1 ::1’ to create the certificates.

#.  Change your directory to your cloned repo.

#.  Start Docker containers::


        cd /path/to/enahant-repo/
        docker-compose up


#.  To Stop Docker containers, Open terminal and run the following commands::


        cd <path-to-repo> //you need to be in your repo folder
        docker-compose down


#.  Invoke cli for conversation id (111 in example below)::


        cd /path/to/enahant-repo
        docker-compose run cli
        python  main.py analyze 111 



Supported Hardware and operating system
========================================

enhant software is supported on the following host operating systems:

* Linux
* mac OS X
* Windows 


**Minimum Docker configuration.**:

* Processor: 2 cpu cores
* RAM: 4GB of system memory
* Hard disk space: 20 GB
* Google Chrome or chromium browser

**Recommended system configuration**:

* Processor: 4 cpu cores
* RAM: 6GB of system memory
* Hard disk space: 30 GB
* Google Chrome or chromium browser


