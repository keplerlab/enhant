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

    typer.echo(f"Your conv ID is {convid}")
    # Get all the analyzers
    analyzers = config.settings.data_analyzers
    #map is a lazy operation and hence needs to be called explicitly
    results = map(methodcaller("process", convid), analyzers)
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