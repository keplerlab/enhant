"""
.. module:: enhant-cli-app
    :platform: Platform Independent
    :synopsis: Main file
"""
import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import typer
from typing import List
import os
import config
from typing import NoReturn, Tuple

from google.cloud import storage

from operator import methodcaller
import helper as helper
import json
import zipfile
import shutil

import subprocess

from colorama import init, Fore, Back


from interaction_finder import InteractionFinder

interaction_finder = InteractionFinder()


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

    input_json_file_name = os.path.join(folder, "input.json")
    input_json_data = None
    if os.path.isfile(input_json_file_name):
        with open(input_json_file_name) as f:
            input_json_data = json.load(f)
    else:
        print(Fore.RED + f"\n ERROR: Input JSON file seems to be missing")

    need_punctation_guest = True
    if "guest" in input_json_data:
        if "need_punctuation" in input_json_data["guest"]:
            need_punctation_guest = input_json_data["guest"]["need_punctuation"]

    need_punctation_host = True
    if "host" in input_json_data:
        if "need_punctuation" in input_json_data["host"]:
            need_punctation_host = input_json_data["host"]["need_punctuation"]

    guest_transcription_list = None
    host_transcription_list = None
    srtListGuest = helper.read_srt_file(folder, "guest")
    srtListHost = helper.read_srt_file(folder, "host")
    if srtListGuest is not None:
        if need_punctation_guest:
            srtListGuest = helper.correct_punctuation_srt_file(
                srtListGuest, config.settings.punct_correction_tool
            )
            helper.save_corrected_srt_file(srtListGuest, folder, "guest")
        guest_transcription_list = helper.transform_Srt_to_list(srtListGuest, "guest")

    if srtListHost is not None:
        if need_punctation_host:
            srtListHost = helper.correct_punctuation_srt_file(
                srtListHost, config.settings.punct_correction_tool
            )
            helper.save_corrected_srt_file(srtListHost, folder, "host")
        host_transcription_list = helper.transform_Srt_to_list(srtListHost, "host")

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
    print(Back.GREEN + f"\n***** Making zip for result: {result_zip_name}.zip ***** \n")
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


def create_bucket_class_location(bucket_name):
    """Create a new bucket in specific location with storage class"""
    bucket_name = "enhant-testing"

    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    bucket.storage_class = "STANDARD"
    new_bucket = storage_client.create_bucket(bucket, location="us")

    print(
        "Created bucket {} in {} with storage class {}".format(
            new_bucket.name, new_bucket.location, new_bucket.storage_class
        )
    )
    return new_bucket


def upload_blob(bucket_name, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    # bucket_name = "enhant-testing"
    # source_file_name = "local/path/to/file"
    # destination_blob_name = "storage-object-name"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(source_file_name)
    return blob
    print("File {} uploaded to {}.".format(source_file_name, destination_blob_name))


def upload_blob_and_run_transcription(
    bucket_name, source_file_name, destination_blob_name, process_folder
):
    try:
        blob = upload_blob(bucket_name, source_file_name, destination_blob_name)
    except Exception as e:
        print("Error in uploading files: ", str(e.output))
        return -1

    try:
        output = subprocess.check_output(
            [
                "node",
                "speaker_dirazation_long_audio.js",
                bucket_name,
                destination_blob_name,
            ]
        )
        # print(output)

        output_json = helper.jsonstring_to_speaker_wise_json(output)
        output_json_file_name = os.path.join(process_folder, "speaker_wise.json")
        with open(output_json_file_name, "w") as json_file:
            print(
                Back.GREEN
                + f"\n***** Writing results in file: {output_json_file_name} ***** \n"
            )
            json.dump(output_json, json_file, indent=4)

        return output_json
    except subprocess.CalledProcessError as e:
        print("\n Subprocess error")
        print(str(e.output))
        return -1

    print("Deleting blob after processing")
    try:
        blob.delete()
    except Exception as e:
        print("Error in deleting blob please delete manually: ", str(e.output))
        return -1


@app.command()
def batchmode(input: str) -> NoReturn:
    # print("input", input)
    if input.endswith(".mp4") or input.endswith(".mov"):

        process_folder = os.path.splitext(input)[0]
        if not os.path.exists(process_folder):
            os.makedirs(process_folder)

        print(Fore.GREEN + f"\nConverting video file:", input)

        try:
            input_video_filename = input
            wav_file_basename = os.path.basename(os.path.splitext(input)[0])
            print("wav_file_basename", wav_file_basename)
            output_wav_filename = os.path.join(
                process_folder, wav_file_basename + ".wav"
            )
            print("output_wav_filename", output_wav_filename)
            output = subprocess.check_output(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-loglevel",
                    "warning",
                    "-y",
                    "-i",
                    input_video_filename,
                    "-ar",
                    "16000",
                    output_wav_filename,
                ]
            )
        except subprocess.CalledProcessError as e:
            print("\n Subprocess error")
            print(str(e.output))
            return -1

        print(Fore.GREEN + f"\nUploading data", output_wav_filename)
        result_json = upload_blob_and_run_transcription(
            "enhant-testing", output_wav_filename, wav_file_basename, process_folder
        )
        interaction_json = interaction_finder.process(result_json)
        #print(json.dumps(interaction_json, indent=6))
        output_json_file_name = os.path.join(process_folder, "processed_results.json")
        with open(output_json_file_name, "w") as json_file:
            print(
                Back.GREEN
                + f"\n***** Writing results in file: {output_json_file_name} ***** \n"
            )
            json.dump(interaction_json, json_file, indent=6)


        #print("result:", result_json)
    elif input.endswith(".wav"):
        process_folder = os.path.splitext(input)[0]
        if not os.path.exists(process_folder):
            os.makedirs(process_folder)
        wav_file_basename = os.path.basename(input)
        print(Fore.GREEN + f"\n Uploading data", input)
        result = upload_blob_and_run_transcription(
            "enhant-testing", input, wav_file_basename, process_folder
        )
        interaction_json = interaction_finder.process(result_json)
        output_json_file_name = os.path.join(process_folder, "processed_results.json")
        with open(output_json_file_name, "w") as json_file:
            print(
                Back.GREEN
                + f"\n***** Writing results in file: {output_json_file_name} ***** \n"
            )
            json.dump(interaction_json, json_file, indent=6)

        #print(json.dumps(interaction_json, indent=6))
        #print("result_json:", result_json)

    else:
        print(Fore.RED + f"\n ERROR: Unsupported file format for batch processing")
        return 0


if __name__ == "__main__":
    app()
