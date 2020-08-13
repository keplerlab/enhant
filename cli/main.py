import typer
import config
from db_handler import MongoDBClient
# Initialize mongo db client

from operator import methodcaller

APP_NAME = "enhant-cli-app"

app = typer.Typer()


@app.command()
def analyze(convid: str):
    """
    Analyzes a full conversation.
    """
    #config.settings.mongo_client.connect()
    # mongo_client.delete_json("5f30de5f32a2c613887abbc2", "notes")

    #config.settings.mongo_client = mongo_client
    typer.echo(config.settings.mongo_DB_string)
    typer.echo(f"Your conv ID is {convid}")
    
    # Get all the analyzers
    analyzers = config.settings.data_analyzers
    results = map(methodcaller("process", convid), analyzers)

    #map is a lazy operation and hence needs to be called explicitly
    list(results)




@app.command()
def delete(convid: str):
    """
    Deletes a full conversation.
    """
    typer.echo("You called delete")
    typer.echo(f"Your conv ID is {convid}")


if __name__ == "__main__":
    app()