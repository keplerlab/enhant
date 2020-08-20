
AI service API Details
======================================


On doing docker up enhant runs ai service:

.. sidebar:: Path for ai flask service

   flask endpoint for ai service is @app.route("/svc", methods=["POST"]


Path for flask service: http://localhost:5000/debug
Method: **POST**
Request format::


    {
        "apiVersion": "2.1"
        "context": "blank"
        "data": { "imgType": base64, "img": "base64_Image" }
    }

imgType could be either base64 or url in future



if error::

    {
        "apiVersion": "2.1"
        "context": "blank"
        "error":
        {
            "code": 404, "message": "Error message"
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

is ::


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


