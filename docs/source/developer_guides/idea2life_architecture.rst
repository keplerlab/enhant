
enhant architecture
======================================


enhant system architecture
---------------------------------

enhant architecture below: Take a look at enhant general architecture.

.. image:: ../images/idea2life_arch.jpeg
        :width: 100%
        :alt: idea2life ai architecture

enhant could be broadly divided in **main module** and **ai module**
here the **main module** could be further divided into following sub modules:

#. **Browser main screen** :
   This is the main screen hosted at *<enhant_url>:1813* which you then
   connect to when starting out idea2life. For more detail about this screen
   you can look at following document.
   :ref:`How to navigate enhant home page`.
   On clicking on an of the page link it send requests back to enhant UI
   controller for appropriate redirects.

#. **Browser Prototype screen** :
   This is the browser Prototype screen hosted at
   *<enhant_url>:1813/generator/ui/* which you get redirected at after
   clicking on  :ref:`navigate_prototype_page` link on main screen.
   Take a look at this link if you want to know more about Prototype process
   using this screen.
   :ref:`enhant Prototype screen.<how to use prototype page>`


#. **Browser admin/customize screen** :
   This is the admin screen hosted at *<enhant_url>:1813/admin/* which you
   will get redirected at after clicking on :ref:`navigate_customize_page`
   link on main page. Take a look at this link if you want to know more about
   process of customization of generated pages using this screen.
   :ref:`enhant customize screen.<How to customize generated pages>`


#. **UI controller** :
   This is the main controller written in Javascript.
   located at *<idea2life_repo>/idea2life/server.js*. All other services for
   enhant talks to this controller for all requests and response.

#. **Generator service** :
   This is the generator service for enhant, this is the primary module
   responsible for generating html content from either xml layout or request
   for prototype page based on theme. Controller service talks to this module
   for both of these tasks.

#. **Customization module** :
   This is the Customization module which performs most of the page
   customization tasks that are requested by :ref:`navigate_customize_page`
   screen, UI controller sends request received by browser related to page
   customizations tasks like rename generated pages, change fonts etc to this
   module. Which then completes these tasks and returns customized pages back
   to controller.


#. **Layout module** :
   This is the layout module written in Javascript. This module converts
   json received from ai module, solves page layout problem and sends result
   back into xml format to controller module.



enhant ai module architecture
--------------------------------
enhant ai module architecture below:


.. image:: ../images/idea2life_ai_arch.jpeg
        :width: 100%
        :alt: idea2life ai architecture


#. **Server module** :
   This is the main service module which hosts rest endpoint for performing
   ai Template detection tasks. Main controller service sends JSON Image data
   to :ref:`svc endpoint<svc_endpoint_ai_service>` of ai module link.
   This module then sanitizes json response and then calls Template detect
   modules for detection of layout template from image. Once detection of
   templates is completed, This then sends result back to idea2life main
   controller. Additionally it hosts one
   :ref:`debug endpoint<debug_endpoint_ai_service>`, use this endpoint
   if you want to check output of template detection for debug purposes.

#. **Template detect module** :
   This module is used for actual template detection, It receives Image sent by
   server module. Converts input image from base64 to binary format, performs
   image resizing. After this a call to pre-trained object detection
   neural network model
   using `PyYolo <https://github.com/keplerlab/pyyolo>`_ library is performed.
   This deep learning
   `model file <https://drive.google.com/file/d/1bE0alaHVfnEjzqhj3EYMzB2RQOscDYdO/view?usp=sharing>`_
   we have trained by using `Darknet/YOLO <https://pjreddie.com/darknet/yolo/>`_
   object detection library.
   After performing object detection using python pyyolo library,
   It then does further detection of extra sub templates like BigParagraph
   from existing elements like paragraph, using method
   **templates_sub_detection**.
   A further processing is performed using **check_N_fix_overlap**
   method for fixing overlap between two detected bounding box.
   Finally result is sent back to ai server module.



