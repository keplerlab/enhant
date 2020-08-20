=====================
Module: ``Server_JS``
=====================


.. contents:: Local Navigation
   :local:

**Children**


.. toctree::
   :maxdepth: 1
   
   
**Description**


This is an example of how to document routes.


.. _module-Server_JS.addRouter:


Function: ``addRouter``
=======================

Dynamically use router.js for the service with 'name' and 'url'.

.. js:function:: addRouter()

    
    :param addRouter(): name
    :param addRouter(): url
    :return Number: loaded_service_router: 0..1
    
.. _module-Server_JS.registerInternalServices:


Function: ``registerInternalServices``
======================================

Auto runs to register internal services defined in config.js.

.. js:function:: registerInternalServices()

    
    
.. _module-Server_JS.registerUI:


Function: ``registerUI``
========================

Registers routing for UI module. UI module does not works as a separate service
and acts as a middle layer between services (internal/external) and enhant UI

.. js:function:: registerUI()
