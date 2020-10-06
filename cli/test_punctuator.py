from punctuator import Punctuator
from pathlib import Path
import os

home = str(Path.home())
model_file = os.path.join(home, ".punctuator", "Demo-Europarl-EN.pcl")
print(f"model_file {model_file}")
p = Punctuator(model_file)
print("Loaded model in memory")
print(p.punctuate("some text"))
print(p.punctuate("some more text"))
print(p.punctuate("some more more text"))
print(p.punctuate("some many more text that needs punctuation"))
