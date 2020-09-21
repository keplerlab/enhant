Analysis CLI (Command Line Interface) Usage
===========================================

The Analysis CLI helps to generate meeting metrics like engagement and
sentiment in the Power mode. It also extracts the questions asked during
the meeting. The zip file generated in the Power mode can be provided to
the analysis CLI service to generate an output zip file which would have
engagement and sentiment metrics.

To use the Analysis CLI:

1. Go to the cloned repo location and start the CLI service by running

.. code-block:: bash

   $ cd /path/to/enhant-repo/
   $ docker-compose run cli

2. Copy the zip file generated in Power mode to be analyzed to the
   ``meeting-data`` folder in the cloned repo location.

3. To process the Power mode generated zip file, run

.. code-block:: bash

   $ python enhant_cli_app.py analyze meeting-data/<meeting-data-input-zip-file>.zip

4. Depending on the length of the meeting, the processing can take time.

5. Once processing is over, a zip file with the name
   ``<meeting-data-input-zip-file>_result.zip`` is generated.

6. The processed zip file can be viewed at the `enhan(t) Meeting Data
   Viewer <https://keplerlab.github.io/enhant-dashboard-viewer/>`__ for
   further details.
