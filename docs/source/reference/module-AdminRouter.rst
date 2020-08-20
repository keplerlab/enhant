=======================
Module: ``AdminRouter``
=======================

.. toctree::
   :maxdepth: 2
   
   
**Description**


Admin - router.js contains all the requests done in the admin module.


.. _module-AdminRouter."/":


Route: ``"/"`` - Go to the Home Page.
===============================================================
.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/"




.. _module-AdminRouter."/errorpage":


Route: ``"/errorpage"`` - Redirected when error is generated
==========================================================================
.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/errorpage"




.. _module-AdminRouter."/view":


Route: ``"/view"`` - View the entire page list.
===============================================================
.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/view"
    

.. _module-AdminRouter."/delete":


Route: ``"/delete"`` - Delete the selected page
===============================================================
.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/delete?page="
    
**Parameters:**

.. csv-table:: 
   :header: "Name", "Type", "Description"
   :widths: 20, 40, 80

   "page", "String", "Name of the page to be deleted"
    

.. _module-AdminRouter."/pagehtmlview":


Route: ``"/pagehtmlview"`` - View a selected page
===============================================================
.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/pagehtmlview?page="


**Parameters:**

.. csv-table:: 
   :header: "Name", "Type", "Description"
   :widths: 20, 40, 80

   "page", "String", "Name of the page to be viewed"


    
.. _module-AdminRouter."/pagenames":


Route: ``"/pagenames"`` - List of all the generated pages 
==============================================================================

.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/pagenames"

    
    
.. _module-AdminRouter."/pageedit":


Route: ``"/pageedit"`` - Open a page in Editor to make few modifications
=============================================================================

.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/pageedit"
    


    
.. _module-AdminRouter."/savepage":


Route: ``"/savepage"`` - Save the edited page
=============================================================================

.. csv-table:: 
   :header: "Method", "Path"
   :widths: 20, 40

   "GET", "/savepage"
    


    
  
.. _module-AdminRouter.scan:


Function: ``scan``
=================================================================================

Return a list of files of the specified fileTypes in the provided dir, 
with the file path relative to the given dir

.. js:function:: scan()

    
    :param directoryName: path of the directory you want to search the files for
    :param fileTypes: array of file types you are search files, ex: ['.txt', '.jpeg']
    :return results: This is the page list
    