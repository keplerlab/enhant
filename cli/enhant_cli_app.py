"""
.. module:: enhant-cli-app
    :platform: Platform Independent
    :synopsis: Main file
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

import typer
from typing import List
import os
import config
from typing import NoReturn, Tuple


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
def analyze(input: str) -> NoReturn:
    """Analyzes a full conversation by taking input zip file containing
    subtitles files host.srt, guest.srt and Input.json Saves a results zip
    containing precessed json

    :param input: Input zip file or folder
    :type input: str
    :return: None
    :rtype: NoReturn
    """
    folder = ""
    if input.endswith(".zip"):
        with zipfile.ZipFile(input, "r") as zip_ref:
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
    srtListGuest = helper.read_srt_file(folder, "guest")
    srtListHost = helper.read_srt_file(folder, "host")
    if srtListGuest is not None:
        srtListGuest = helper.correct_punctuation_srt_file(srtListGuest, config.settings.use_punct_correction)
        guest_transcription_list = helper.transform_Srt_to_list(srtListGuest, "guest")
        helper.save_corrected_srt_file(srtListGuest, folder, "guest")

    if srtListHost is not None:
        srtListHost = helper.correct_punctuation_srt_file(srtListHost, config.settings.use_punct_correction)    
        host_transcription_list = helper.transform_Srt_to_list(srtListHost, "host")
        helper.save_corrected_srt_file(srtListHost, folder, "host")

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
        ),
        analyzers,
    )
    list(results)

    output_json_file_name = os.path.join(folder, "processed.json")
    with open(output_json_file_name, "w") as json_file:
        print(
            Back.GREEN
            + f"\n***** Writing results in file: {output_json_file_name} ***** \n"
        )
        json.dump(input_json_data, json_file, indent=4)
        
    result_zip_name = folder + "_result"
    print(
        Back.GREEN
        + f"\n***** Making zip for result: {result_zip_name}.zip ***** \n"
    )
    shutil.make_archive(result_zip_name, "zip", folder)
    print(
        Back.GREEN
        + f"\n***** Upload this zip and view the results on this url: https://keplerlab.github.io/enhant-dashboard-viewer/***** \n"
    )


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
