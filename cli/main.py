import typer

import config

APP_NAME = "enhant-cli-app"

app = typer.Typer()


@app.command()
def analyze(convid: str):
    """
    Analyzes a full conversation.
    """
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