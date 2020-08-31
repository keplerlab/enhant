# Basics

Enhant is AI powered platform which enables real time analytics of video calls. Enhant enables participants engagement & sentiment detection, capture moments and notes, analyze interrogatives to find commonly asked questions, etc.

Enhant comes with docker and internally creates multiple containers:

1. Chrome plugin: Enhant uses chrome plugin for getting meeting audios for any compatible services that can run on web browser e.g. Teams, Zoom etc. 

2.  Mongo: Enhant use mongo to store user and meetings data. The mongo service handles all the installation and the data is stored inside */path/to/enhant/db*.
**Mongo is exposed on port 27018**.

3. Transcription: Enhant uses python based Transcription service to transcribe speech **Transcription API service is exposed on port 1111**. 

4. Message Processor: An fastapi server to host the enhant web server. **Web server is exposed on port 8000**.

5. cli: Enhant uses Natural Language processing service for Sentiment & Engagement analysis, and detecting client interrogatives. 
**NLP is run using batch process and invoked as command line utility made using typer python framework. 



# Running Enhant

1. Clone repo 
```
git clone https://github.com/keplerlab/enhant.git
```

#### On **Windows** to prevent line ending issues clone using this command instead
```
git clone  https://github.com/keplerlab/enhant.git --config core.autocrlf=false
```



2. Start Docker containers:

```
cd /path/to/enahant-repo/
docker-compose up
```

3. Invoke cli for conversation id (111 in example below):

```
cd /path/to/enahant-repo
docker-compose run cli
python  main.py analyze 111 
```

# Add certificate for localhost dev

## Install mkcert utility 

### macOS

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

### Linux

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


### Windows

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


## Install local certificate authority using mkcert

```
$ mkcert -install
Created a new local CA at "/Users/filippo/Library/Application Support/mkcert" 💥
The local CA is now installed in the system trust store! ⚡️
The local CA is now installed in the Firefox trust store (requires browser restart)! 🦊
```

## Create new certificate using mkcert 
```
$ cd certificates
$ mkcert localhost 127.0.0.1 ::1
```
You should see following output with last command
```
Using the local CA at "/****/******/**/***/mkcert" ✨

Created a new certificate valid for the following names 📜
 - "localhost"
 - "127.0.0.1"
 - "::1"

The certificate is at "./localhost+2.pem" and the key at "./localhost+2-key.pem" ✅
```


# Building documentation using sphinx 


1. Start Docker containers:

```
cd /path/to/enahant-repo/
docker-compose up
```

2. Invoke cli for conversation id :

```
cd /path/to/enahant-repo
docker-compose run cli
```

3. Goto docs folder: 

```
cd ../docs
```

4. Issue build command: 

```
make html
```

Documentation will be available outside container at path <enhant-repo/docs/build/html> folder
