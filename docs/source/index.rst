.. enhant documentation master file, created by
   sphinx-quickstart
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.


#######################
Overview
#######################

enhan(t) is an open source toolkit which enables you to enhance the web experience of existing video conferencing solutions like Zoom, MS Teams and Jitsi. It allows normal users to get an enhanced meeting experience by allowing one to bookmark moments, capture screenshots and take notes and view them in context with the meeting recording. It also enables power users to get NLP (Natural Language Processing) powered real-time meeting metrics like engagement and sentiment. Moreover, it can provide extract questions which were asked during the meeting and when.

**Etymology**
==============
enhan(t) = enhanced + analytics + (t)oolkit

Features
==============

*	Bookmark moments (to mark an important part of the meeting along with transcript)
*	Capture screenshots (to take a timestamped screenshot of the tab)
*	Take notes (to take manual notes along with when it was taken)
*	Download meeting data (which contains above mentioned bookmarks, screenshots and notes along with meeting transcript)
*	Power mode
*	Engagement metrics
*	Sentiment metrics
*	Extract interrogatives (find what questions were asked during the meeting and when)
*	Get host side transcription (via microphone) in the Basic mode and both host and guest side transcription (via tab audio) in the Power mode (with the companion docker compose application)
*	View meeting data in a comprehensive dashboard

**Why use enhan(t)**:
Taking notes during a meeting has been a historically cumbersome task. People take manual notes, take screenshots with a Win + Print Screen or a Cmd + Shift + 3 or the likes, do a recording, etc.

**But can this experience be enhanced?**:

That is what enhan(t) is all about. By leveraging existing web based meeting solutions and providing a Chrome extension, the user is able to now take a bookmark to mark an important moment and what was spoken in the last <few> seconds, take screenshot of the tab with a single click and still provide the flexibility of taking manual notes. All of these come along with when these actions were taken, so that at a later point of time, this data could be overlaid on top of a meeting recording to provide a lot more context to the important parts of the meeting. This is all apart from the full meeting transcript.

Additionally, it provides Power users like customer support agents, financial advisors and the likes more pertinent meeting metrics like engagement and sentiment along with the questions which were asked during the meeting.

enhan(t) therefore goes beyond the traditional note taking and provides much more value by serving contextual data and meeting metrics.

**Parts of enhan(t)**:
------------------------
*	Chrome extension (required)
*	Docker compose application (optional)
*	enhan(t) meeting data viewer (optional)


**Chrome Extension**:
^^^^^^^^^^^^^^^^^^^^^^^^^^^
Then enhan(t) Chrome extension is the minimum requirement to get started with enhan(t) in a meaningful way.  It allows basic users to enhance the meetings conducted in Zoom, MS Teams or Jitsi on the Chrome browser. It enables users to bookmark moments (capture the timestamp of the moment along with the last <few> seconds of host side transcription), capture screenshots (take the screenshot of the visible tab area along with the timestamp), take notes (take manual notes along with timestamp) and transcript the host side of the conversation (from the microphone) after hitting the record icon. On ending the enhan(t) session, the user is provided with a zip download, containing all the data captured. This data can be viewed as plan text after extracting the zip download or can be viewed in the enhan(t) data viewer.

<Show Basic mode screenshots>

The extension can provide more data if used in Power mode alongside the companion transcription service. Once the setup is done, Docker application run and the Power mode is enabled in the extension settings, the extension will now be able to transcript both the host side (via microphone) and guest side (via tab audio) of the conversation. Bookmarking moment would come along with the transcription of the last <few> seconds of both side of the conversation. Additionally, meeting metrics like engagement and sentiment is also provided. Post the call, all the questions asked during the meeting can be extracted via interrogative analysis.

<Show Power mode screenshots>

**Transcription Service**:
^^^^^^^^^^^^^^^^^^^^^^^^^^^
The transcription service enables the speech to text conversion for the guest side conversations in the Power mode of the Chrome extension.

The transcription service uses an open source speech recognition toolkit called Vosk (https://alphacephei.com/vosk/) for speech to text conversion by default. Alternatively, Google Cloud Speech to Text service could be used.

**CLI (Command Line Interface)**:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The CLI enables the generation of meeting metrics like engagement and sentiment in the Power mode. The zip file generated in the power mode can be provided to the CLI service to generate an output zip file which would have engagement and sentiment metrics.

**enhan(t) Meeting Data Viewer**:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The enhan(t) Meeting Data Viewer where a user can view a downloaded meeting data zip file in context.

<Meeting Data Viewer screenshot basic mode>

Once a basic mode meeting data zip file is loaded locally, the user can view the following details along with the time:
*	Meeting duration
*	Meeting ID
*	Bookmarks
*	Screenshots
*	Notes
*	Audio or video recording overlayed with bookmarks, screenshots and notes moments (if user uploads them)

<Meeting Data Viewer screenshot power mode>

If a power mode meeting data zip file is loaded, along with the basic mode details, one can also view:
*	Average engagement
*	Average sentiment
*	Sentiment and engagement overlay graph on the audio or video recording
*	Sentiment outliers
*	Extracted interrogatives



Knowing the document organization will help you find and use features effectively and quickly:

*  **Getting Started** is guide for starting enhant service in shortest amount of time. Start here if you’re new to enhant.

*  **How-to guides** are recipes for enhant users. They guide you through the steps involved in addressing use-cases key issues.

*  **Developer guides** are recipes for enhant developer, who want to contribute and extend enhant functionality.

*  **Topic guides** discuss key topics and concepts at a fairly high level and provide useful background information and explanation 

*  **API reference** contain technical reference for APIs, mostly autogenerted from underlying code.


.. toctree::
   :maxdepth: 1

   
   Getting Started <getting_started>
   How to guides <how_to_guides>
   Developer guides <developer_guides>
   Topic guides <topic_guides>
   Troubleshooting and FAQ <troubleshooting>
   API reference <reference>

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
