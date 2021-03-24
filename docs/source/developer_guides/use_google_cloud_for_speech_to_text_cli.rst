
.. _use_google_cloud_for_speech_to_text_cli:

Installing the Transcription Service and Analysis CLI (Command Line Interface) with Google cloud
=================================================================================================

The transcription service and analysis CLI enables the Power mode in the Chrome extension to work. It enables guest side transcription, provides engagement, sentiment and interrogatives.

**Note : Power mode is unavailable on firefox because of lack of support for capturing tab audio.**

The transcription service and the analysis CLI can be installed as a Docker compose application.
To install both as application using docker application follow these instructions:

#.  Make sure you have Docker installed on your system. If not, go to https://docs.docker.com/get-docker/ and follow the instructions there to get started with Docker.

#.  Make sure you have Git installed. If not, go to https://www.atlassian.com/git/tutorials/install-git and follow the instructions there.

#.  You can find the enhan(t) project on Github at https://github.com/keplerlab/enhant. Clone the repository by running the following git clone command on your terminal::

        git clone https://github.com/keplerlab/enhant.git

    On **Windows** to prevent line ending issues clone using this command instead::

        git clone  https://github.com/keplerlab/enhant.git --config core.autocrlf=false

#.  Next, to have locally trusted development certificates we need to install mkcert. Please follow the installation instructions :ref:`certificate_for_localhost` for detailed instructions
#.  Now go to the cloned ‘enhant’ directory and then run go to certificates directory.::

        $ cd certificates-and-credentials

#.  Run following to create the certificates.::

        $ mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1

#.  Change your directory to your cloned repo.

#.  To use Google cloud for speech to text, you need to register for google 
    speech to text API, download the google cloud service credentials file on your system
    and copy it into folder **<repo_folder>/certificates-and-credentials** folder
    additionally rename file as *google_credential_file.json*.

#.  Start Docker containers::


        cd /path/to/enhant-repo/
        docker-compose -f docker-compose-google-cloud.yml up


#.  To Stop Docker containers, Open terminal and run the following commands::


        cd <path-to-repo> //you need to be in your repo folder
        docker-compose -f docker-compose-google-cloud.yml down
