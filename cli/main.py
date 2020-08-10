import typer

import config

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
    analyzers = config.settings.get_data_analyers()
    results = map(methodcaller("show"), analyzers)

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