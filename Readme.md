# enhan(t) Note Taking Power Tool

## Resources
* Homepage and Reference: https://enhant.readthedocs.io/en/latest/
* Chrome webstore link for plugin: [here](https://chrome.google.com/webstore/detail/enhant-meeting-power-tool/fohcdemnkddkfcbheibnjhnpfliemnfg)
* Firefox extension link for plugin: [here]
(https://addons.mozilla.org/en-US/firefox/addon/enhan-t-note-taking-power-tool/)

## Basics

enhan(t) is an open source toolkit that enhances your note taking ability on web. Users have reported considerable improvement in their productivity  during video conferencing solutions like Zoom, MS Teams and Jitsi due to effective note taking. The tools doesn't ends here. In the power mode, it enables power meeting metrics like engagement, sentiment and can even extract questions asked during the meeting along with the timestamp.


## Features

1. Bookmark moments (to mark an important part of the meeting)
1. Capture screenshots (to take a timestamped screenshot of the tab)
1. Take notes (to take manual notes using your voice along with when it was taken)
1. Use voice commands such as "Take screenshot" or "Bookmark Moment" to do the same.
1. Select text on the page to add it as a note.
1. Collapse / expand the toolbar as per your preference.
1. Download data (which contains above mentioned bookmarks, screenshots and notes in .txt and .pdf file along with transcript)
1. Power mode
    1. Engagement metrics
    1. Sentiment metrics
    1. Extract interrogatives (find what questions were asked during the meeting and when)
1. Get host side transcription (via microphone) in the Basic mode and both host and guest side transcription (via tab audio) in the Power mode (with the companion docker compose application)
1. View data in a comprehensive dashboard

## Parts of enhan(t)
* Chrome extension
* Transcription Service and CLI
* enhan(t) data viewer

### Chrome Extension
Then enhan(t) Chrome extension is the minimum requirement to get started with enhan(t) in a meaningful way.  It allows basic users to enhance the meetings conducted in Zoom, MS Teams or Jitsi on the Chrome browser. It enables users to:
* Bookmark moments (capture the timestamp of the moment along with the last 10 seconds of host side transcription)
* Capture screenshots (take the screenshot of the visible tab area along with the timestamp)
* Take notes (take manual notes along with timestamp)
* Transcript the host side of the conversation (from the microphone)
* Download meeting data zip file which contains all the above data

The extension can provide more data if used in Power mode alongside the companion transcription service. Once the setup is done, Docker application run and the Power mode is enabled in the extension settings, the extension will now be able to:
* Transcript both the host side (via microphone) and guest side (via tab audio) of the conversation
* Bookmarking moment with the transcription of the last 10 seconds of both side of the conversation
* Meeting metrics like engagement and sentiment and the questions asked during the meeting, can be extracted by processing the meeting data zip file using the CLI.


## Running Enhant

1. Clone repo 
```
git clone https://github.com/keplerlab/enhant.git
```

##### On **Windows** to prevent line ending issues clone using this command instead
```
git clone  https://github.com/keplerlab/enhant.git --config core.autocrlf=false
```



2. Start Docker containers:

```
cd /path/to/enhant-repo/
docker-compose up
```
If you want to use Google cloud use this instance
```
cd /path/to/enhant-repo/
docker-compose -f docker-compose-google-cloud.yml  up
```

3. Invoke cli for input zip file from plugin (input.zip in example below):

```
cd /path/to/enhant-repo
docker-compose run cli
python enhant_cli_app.py analyze meeting_data/input.zip
```

## Add certificate for localhost dev

### Install mkcert utility 

#### macOS

On macOS, use [Homebrew](https://brew.sh/)

```
brew install mkcert
brew install nss # if you use Firefox
```

or [MacPorts](https://www.macports.org/).

```
sudo port selfupdate
sudo port install mkcert
sudo port install nss # if you use Firefox
```

#### Linux

On Linux, first install `certutil`.

```
sudo apt install libnss3-tools
    -or-
sudo yum install nss-tools
    -or-
sudo pacman -S nss
    -or-
sudo zypper install mozilla-nss-tools
```


#### Windows

On Windows, use [Chocolatey](https://chocolatey.org)

```
choco install mkcert
```

or use Scoop

```
scoop bucket add extras
scoop install mkcert
```

or build from source (requires Go 1.10+), or use [the pre-built binaries](https://github.com/FiloSottile/mkcert/releases).

If you're running into permission problems try running `mkcert` as an Administrator.


### Install local certificate authority using mkcert

```
$ mkcert -install
Created a new local CA at "/Users/filippo/Library/Application Support/mkcert" 💥
The local CA is now installed in the system trust store! ⚡️
The local CA is now installed in the Firefox trust store (requires browser restart)! 🦊
```

### Create new certificate using mkcert 
```
$ cd certificates-and-credentials
$ mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1
```
You should see following output with last command
```
Using the local CA at "/****/******/**/***/mkcert" ✨

Created a new certificate valid for the following names 📜
 - "localhost"
 - "127.0.0.1"
 - "::1"
 
The certificate is at "cert.pem" and the key at "key.pem" ✅
```


## Attributions
1. For offline speech to text we use vosk-server https://github.com/alphacep/vosk-server which in turn uses Kaldi and Vosk-API.
2. For sentiment analysis we use pre-trained sentiment model provided by flair library, https://github.com/flairNLP/flair library. 
3. For correction of text punctuations we use fastpunct https://github.com/notAI-tech/fastPunct library.
