import zipfile, xml.etree.ElementTree as ET, posixpath, os
from PIL import Image

# We need to read the 7 card names for each hand slide.
# In hand_crops_test/slide19_hand1.png, we saw:
# [Thoughtcast, Utrom Monitor, Extract a Confession, Galvanic Blast, Pyroblast, Drossforge Bridge, Drossforge Bridge]

print("Script template ready.")
