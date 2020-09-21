
.. _certificate_for_localhost:

####################################################
How to add certificate for localhost for cli utility
####################################################

==============================================
Install mkcert utility 
==============================================

macOS
=============


On macOS, use [Homebrew](https://brew.sh/)::


    brew install mkcert
    brew install nss # if you use Firefox


or [MacPorts](https://www.macports.org/).::


    sudo port selfupdate
    sudo port install mkcert
    sudo port install nss # if you use Firefox


Linux
================


On Linux, first install `certutil`.::


    sudo apt install libnss3-tools
        -or-
    sudo yum install nss-tools
        -or-
    sudo pacman -S nss
        -or-
    sudo zypper install mozilla-nss-tools



Windows
==============================================


On Windows, use [Chocolatey](https://chocolatey.org)::


    choco install mkcert


or use Scoop::


    scoop bucket add extras
    scoop install mkcert


or build from source (requires Go 1.10+), or use [the pre-built binaries](https://github.com/FiloSottile/mkcert/releases).

If you're running into permission problems try running `mkcert` as an Administrator.

====================================================
Install local certificate authority using mkcert
====================================================
::

        $ mkcert -install
        Created a new local CA at "/Users/filippo/Library/Application Support/mkcert" 💥
        The local CA is now installed in the system trust store! ⚡️
        The local CA is now installed in the Firefox trust store (requires browser restart)! 🦊


====================================================
Create new certificate using mkcert 
====================================================
::


        $ cd certificates-and-credentials
        $ mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1


You should see following output with last command::


        Using the local CA at "/****/******/**/***/mkcert" ✨

        Created a new certificate valid for the following names 📜
        - "localhost"
        - "127.0.0.1"
        - "::1"

        The certificate is at "cert.pem" and the key at "key.pem" ✅



