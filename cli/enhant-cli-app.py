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
import helper as helper

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
    guest_transcription_list = None
    host_transcription_list = None
    if os.path.isfile(host_srt_file_name):
        host_srt = pysrt.open(host_srt_file_name)
        print("host_srt: ", host_srt)
        host_transcription_list = helper.transformSrt(host_srt, 0)
        host_transcription_list = helper.add_origin(host_transcription_list, "host")
    else:
        print("Error opening host srt file: ", host_srt_file_name)

    guest_srt_file_name = os.path.join(folder, "guest.srt")
    if os.path.isfile(guest_srt_file_name):
        guest_srt = pysrt.open(guest_srt_file_name)
        #print("guest_srt: ", guest_srt)
        guest_transcription_list = helper.transformSrt(guest_srt, 0)
        guest_transcription_list = helper.add_origin(guest_transcription_list, "guest")
    else:
        print("Error opening host srt file: ", guest_srt_file_name)

    print("guest_transcription_list", guest_transcription_list)
    print("host_transcription_list", host_transcription_list)

    # Get all the analyzers
    analyzers = config.settings.data_analyzers
    
    # map is a lazy operation and hence needs to be called explicitly
    results = map(methodcaller("process", guest_transcription_list, host_transcription_list), analyzers)
        

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
