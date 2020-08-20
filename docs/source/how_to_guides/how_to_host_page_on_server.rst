.. _how_to_host_page_on_server:

Hosting Generated Webpages from enhant
----------------------------------------------------------------------

By default, enhant puts your data inside <path-to-repo>/enhant/userData. This directory is also mounted inside docker at /usr/src/app/userData. 
You page name will exist as a folder here which can be copy pasted and hosted on a different server. 
However, this will work if your static path is mapped correctly.

Lets assume you have a node application (using express server) with package.json

.. code-block:: js

    {
        "main": "server.js" // assuming this is where http / https server is created
    }

and your typical application structure with static files looks like

| app
|   ├── /static/
|   ├── server.js

To host the page: 

1. Copy the folder at <path-to-repo>/enhant/userData/pageName into /static/.
2. you should additional static mapping to point to this directory. To do so, put the following code in your server.js:

.. code-block:: js
    
    {
        app.use('/static_page', express.static(path.join("static"))); // path to your static
    }


(This is because enhant prepends all dependent static file urls with */static_page/* )

