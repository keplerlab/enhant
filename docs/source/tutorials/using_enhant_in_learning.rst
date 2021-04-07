.. _using_enhant_in_learning:

Using enhan(t) for learning purposes
=============================================

enhan(t) can be used with e-learning platforms (or any site) for personal development and learning.

When in basic mode, enhan(t) will collect all data in a .zip file (downloaded when the recording is stopped). 
The zip file contains the following:

1. **host.srt** : A subtitle file containing the transcription data of the host.

2. **images** : Folder containing all the images captured using enhan(t).

3. **notes.pdf** : The contains all the data captured via enhan(t) and in the order it was captured w.r.t time. The pdf file can
be shared with others as part of meeting notes.

4. **notes.txt** : This is a raw text file containing the meeting data. It contains relative path to the image
inside the images folder. The txt file is plain raw data for developers to consume it in other applications based
on their need

5. **notes.md** : Markdown is a standard in lot of note-taking applications and platforms. Users can visualize the
notes in either Visual Studio Code or a note-taking app such as Evernote / Joplin. These platforms support Markdown
import so you can collect notes via enhan(t) and then import it inside a note-taking app.

When in power mode, enhan(t) will also transcribe the audio data for guest (speakers on the other side of the call).
This transcription is available in a separate **guest.srt** file inside the zip. When run in conjuction with
the analysis CLI, users will also get engagement and sentimentent scores, as well as, the outliers (both negative and positive)
during the meeting.

For more details on using the power mode, refer the guide :ref:`power_mode`.:  

Lets look at some scenarios on how the data from enhan(t) can be consumed:


1. **Use enhan(t) visualizer**: 

enhan(t) comes with out-of-the box visualizer, details here :ref:`viewing_meeting_data`: .
This is a web based visualization tool that works only with enhan(t) zip files. The zip data donwloaded using the
enhan(t) extension can be uploaded here, with an optional meeting recording.

Look at some some examples here: :ref:`using_enhant_in_meetings`.: 

2. **Use Visual Studio code**: 
Visual studio comes with markdown support out-of-the-box. Here are the steps to import enhan(t) data inside VSC:

    1. Import the zip file inside a folder.
    2. Install plugin zip-extract-all (if not installed) from `here <https://marketplace.visualstudio.com/items?itemName=AnchovyStudios.zip-extract-all>`_.
    3. Extract all zip files inside the folder.
    4. Click on notes.md inside the extracted folder to see the note.

We encourage users to add links in the **notes.md** file to navigate from one
note to another. To do this simple add the following to source markdown file:

    [name_of_the_note](relative/path/to/destination/note)

For more details on markdown support with visual studio code, visit https://code.visualstudio.com/docs/languages/markdown.


3. **Use Evernote**:
Evernote own its own does not fully support markdown, but when in conjuction with
Marxico (http://marxi.co/) - a delicate mardown editor for evernote, one can import
enhan(t) **notes.md** file. 


4. **Use Joplin**: 
enhan(t) generates the **notes.md** file that can be imported into joplin out-of-the-box.
Note that the images needs to be imported separately because Joplin does not import
relatives path of images on its own. Details on how to import markdown in Joplin is mentioned
here : https://joplinapp.org/
