"""
.. module:: Main file
    :platform: Platform Independent
    :synopsis: Main file
"""

import typer
from typing import List
import os
import config
import pysrt

from operator import methodcaller
import srt_helper as srt_helper

APP_NAME = "enhant-cli-app"

app = typer.Typer()


@app.command()
def analyze(folder: str):
    """[Analyzes a full conversation.]

    :param conv_ids: [description]
    :type conv_ids: List[str]
    """

    typer.echo(f"Analyzing folder {folder}")
    
    host_srt_file_name = os.path.join(folder, "host.srt")
    if os.path.isfile(host_srt_file_name):
        host_srt = pysrt.open(host_srt_file_name)
        print("host_srt: ", host_srt)
    else:
        print("Error opening host srt file: ", host_srt_file_name)

    guest_srt_file_name = os.path.join(folder, "guest.srt")
    if os.path.isfile(guest_srt_file_name):
        guest_srt = pysrt.open(guest_srt_file_name)
        print("guest_srt: ", guest_srt)
    else:
        print("Error opening host srt file: ", guest_srt_file_name)

    srt_helper.transformSrt(guest_srt,0,0)

    # Get all the analyzers
    analyzers = config.settings.data_analyzers
    
    # map is a lazy operation and hence needs to be called explicitly
    results = map(methodcaller("process", folder), analyzers)
        

@app.command()
def delete(folder: str):
    """[Deletes a full conversation.]

    :param folder: [description]
    :type folder: str
    """    
    typer.echo("You called delete")
    typer.echo(f"Your folder is {folder}")


if __name__ == "__main__":
    app()
