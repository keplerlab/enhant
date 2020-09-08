"""
.. module:: Main file
    :platform: Platform Independent
    :synopsis: Main file
"""

import typer
from typing import List
import os
import config


from operator import methodcaller
import helper as helper
import json
import zipfile
import shutil

from colorama import init, Fore, Back 
init(init(autoreset=True))

APP_NAME = "enhant-cli-app"

app = typer.Typer()


@app.command()
def analyze(input: str):
    """[Analyzes a full conversation.]

    :param conv_ids: [description]
    :type conv_ids: List[str]
    """
    folder = ""
    if input.endswith(".zip"):
        with zipfile.ZipFile(input, 'r') as zip_ref:
            folder = os.path.splitext(input)[0]
            zip_ref.extractall(folder)
    elif os.path.isdir(input):
        folder = input 
    else: 
        print(Fore.RED + f"\n ERROR: Invalid zip file or folder")
        return 0


    print(Back.GREEN + f"\n ***** Analyzing folder {folder} *****")

    guest_transcription_list = None
    host_transcription_list = None

    guest_transcription_list = helper.transform_Srt_to_list(folder, "guest")
    host_transcription_list = helper.transform_Srt_to_list(folder, "host")


    input_json_file_name = os.path.join(folder, "input.json")
    input_json_data = None
    if os.path.isfile(input_json_file_name):
        with open(input_json_file_name) as f:
            input_json_data = json.load(f)

    else:
        print(Fore.RED + f"\n ERROR: Input JSON file seems to be missing")

    # Get all the analyzers
    analyzers = config.settings.data_analyzers

    # map is a lazy operation and hence needs to be called explicitly
    results = map(
        methodcaller(
            "process",
            input_json_data,
            guest_transcription_list,
            host_transcription_list,
        ), analyzers)
    list(results)

    output_json_file_name = os.path.join(folder, "processed.json")
    with open(output_json_file_name, 'w') as json_file:
        print(Back.GREEN + f"\n***** Writing results in file: {output_json_file_name} ***** \n")
        json.dump(input_json_data, json_file, indent=4)
        result_zip_name = folder+"_result"
        print(Back.GREEN + f"\n***** Making zip for result: {result_zip_name}.zip ***** \n")
        shutil.make_archive(result_zip_name, 'zip', folder)

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
