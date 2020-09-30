from google.cloud import storage

import typer
from typing import List
import os
from typing import NoReturn, Tuple


from operator import methodcaller
import json
import zipfile
import shutil

from colorama import init, Fore, Back

init(init(autoreset=True))

APP_NAME = "enhant-cli-batch"

app = typer.Typer()

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

    print(
        "File {} uploaded to {}.".format(
            source_file_name, destination_blob_name
        )
    )

#create_bucket_class_location("enhant-testing")

@app.command()
def test_batch_wav(input: str) -> NoReturn:
    print("input", input)
    if input.endswith(".wav"):
        print(Fore.GREEN + f"\n Uploading data", input)

        upload_blob("enhant-testing", input, "LLP_test.wav")


    else:
        print(Fore.RED + f"\n ERROR: Invalid zip file or folder")
        return 0

#upload_blob("enhant-testing", "./LLP.wav", "LLP.wav")

if __name__ == "__main__":
    app()