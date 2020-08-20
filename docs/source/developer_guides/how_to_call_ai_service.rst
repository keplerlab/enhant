
How to call AI service
===============================


enhant AI Service handles template detection task.
It is hosted as a flask service separately as python flask service.

URL for this flask service is at: *http://<ip_address_of_flask_server>:5000*

It internally hosts two separate endpoints as listed below.

.. _svc_endpoint_ai_service:

1) Main endpoint template detection:
------------------------------------------------

| Path for flask service: *http://<ip_address_of_flask_server>:5000/svc*
| Method: **POST**

Request format::


        {
            "apiVersion": "2.1"
            "context": "blank"
            "data":
            {
                "imgType": base64, "img": "base64_Image"
            }
        }


Please note currently imgType  of only **base64** is supported,
will add imgType **url** in future


In case of error enhant will return error in this format::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": <ERR_CODE>, "message": <ERROR_MESSAGE>
        }
    }


Response format if Image present but no detection ::

    {
    "apiVersion": 2.1,
    "context": "blank",
        "data":
        {
            "height": "700",
            "results": [],
            "width": "1050"
        }
    }


Response format For this Image:

.. image:: ../images/test_video.jpeg
        :width: 300px
        :alt: Test Image for video template


::


    {
        "apiVersion": 2.1,
        "context": "blank",
        "data":
        {

            "height": "480",
            "results": [
                {
                    "bottom": 370,
                    "class": "Video",
                    "left": 175,
                    "prob": 0.789800226688385,
                    "right": 375,
                    "top": 176
                }
            ],
            "width": "640"
        }
    }


**Possible error list for /svc endpoint:**

#. Invalid api version.::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 301, "message": "api version not received"
        }
    }


#. Invalid api version request received.::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 302, "message": "Invalid api version request received"
        }
    }


#. Context field not found in request.::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 409, "message": "Context not found"
        }
    }


#. Invalid request,error string received in request body"::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 410, "Invalid request, Received error in request body"
        }
    }


#. Data not found: data field in request not found.::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 411, "message": "data not found: data field in reqest not found"
        }
    }


#. Unsupported imgType or data, If imgType is different then base64 or url ::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 412, "message": "Unsupported imgType or data"
        }
    }


#. image field in data not found. ::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 413, "message": "image field in data not found"
        }
    }

#. Error in converting base64 image to image. ::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 414, "message": "Error in converting base64 image to image"
        }
    }


#. Detection error, No template detected in image ::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 415, "message": "Detection error, No template detected in image"
        }
    }



.. _debug_endpoint_ai_service:

2) Debug endpoint :
---------------------

| Path for flask service: *http://<ip_address_of_flask_server>:5000/debug*
| Method: **GET**
| Request format: NONE

**Note: For debug view of previous detections just open URL in your browser**


