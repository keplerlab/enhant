import typer
import config
from db_handler import MongoDBClient
import asyncio
# Initialize mongo db client
mongo_client = MongoDBClient(config.settings.mongodb_hostname, config.settings.mongodb_port, config.settings.mongodb_dbname)

APP_NAME = "enhant-cli-app"

app = typer.Typer()


@app.command()
def analyze(convid: str):
    """
    Analyzes a full conversation.
    """
    mongo_client.connect()
    mongo_client.delete_json("5f30de5f32a2c613887abbc2", "notes")
    typer.echo(config.settings.mongo_DB_string)
    typer.echo(f"Your conv ID is {convid}")


@app.command()
def delete(convid: str):
    """
    Deletes a full conversation.
    """
    typer.echo("You called delete")
    typer.echo(f"Your conv ID is {convid}")


if __name__ == "__main__":
    app()