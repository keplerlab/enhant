####################################
Tips, Troubleshooting and FAQs
####################################

FAQ
=========

What does offset mean in Enhant Dashboard Viewer? 
-----------------------------------------------------

If you upload recording in addition to the meeting data, you see a separate video section in the dashboard.
On top of the video seekbar / progress bar you will see how notes have been captured over time as
well as the variation of sentiment and engagement score (in a line chart). On clicking the settings
icon in the video media player, you see the option to enable/disable the chart and one to add a time based
offset of format hh:mm:ss. This offset is a means for you to indicate time difference between the moment
you started the recording and the moment when enhant plugin was started. 

For example, if your recording started 10 min before the enhant plugin - you will add the offset 
value -00:10:00 and if the recording started 10 minutes after the plugin you will add the offset value of 00:10:00. 
Doing this will shift the timeline for all the data across the dashbaord and you will get better 
sense of guest actions over the course of entire recording.

In a situation where the offset is positive (recording started after the enhant), any data collected 
before the recording will be represented in negative time. This happens because data is now represented
in the context of the recording uploaded.

By default - it is assumed that the plugin and the recording started around the same time.

Note: Offset calculation is a manual process, and needs to be evaluated separately because recording is
not part of the enhant system so there is no way to evaluate inside of dashboard automatically.


What are the supported languages? 
-------------------------------------------
   Currently we provide support for English (US).
 

Error:- Docker container crashed
---------------------------------

If your transcription service crashes or docker goes down, please raise a issue on github with details.
Check if you have allocated sufficient RAM to docker container by going to docker 
dashboard, enhant local transcription service needs at least 4 GB of RAM for it to 
work without issue, After allocating sufficient memory/RAM restart application. 
To restart the application, open terminal and run the following commands::

        cd <path-to-repo> //you need to be in your repo folder

        docker-compose up

enhant will start again

Error:- certfile=cfg.CERT_FILE_PATH, keyfile=cfg.KEY_FILE_PATH FileNotFoundError: [Errno 2] No such file or directory
------------------------------------------------------------------------------------------------------------------------------------
Make sure you have installed local ssl certificate before starting service using 
docker-compose up.
Refer :ref:`certificate_for_localhost` for instructions


Remove all Dangling Docker images
-----------------------------------

If you are using docker to build and manage enhant it may happen
that after running *docker-compose build* multiple times you may
start to run out of disk space.
To recover some of this disk space you can remove dangling docker images
using this command::
 
        docker rmi $(docker images -f 'dangling=true' -q)
        docker system prune