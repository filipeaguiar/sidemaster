from PIL import Image
import os

# From earlier inspection of slide 17:
# Hand 1:
# 2 [Thoughtcast], 1 [Blood Fountain], 1 [Reckoner's Bargain], 1 [Galvanic Blast], 1 [Great Furnace], 1 [Vault of Whispers]
# Hand 2:
# 1 [Sewer-veillance Cam], 2 [Pyroblast], 1 [Mistvault Bridge], 1 [Seat of the Synod], 2 [Vault of Whispers]
# Hand 3:
# 1 [Black Mage's Rod], 1 [Reckoner's Bargain], 1 [Refurbished Familiar], 1 [Pyroblast], 1 [Red Elemental Blast], 1 [Drossforge Bridge], 1 [Ichor Wellspring]

# Let's crop cards from slide 17 images:
# slide 17 has image25.png (hand 1), image22.png (hand 2), image10.png (hand 3)
import zipfile
with zipfile.ZipFile('sources/V.4 PT BR Side Guide Grixis Affinity .pptx') as z:
    with open('hand_crops_test/slide17_hand1.png', 'wb') as f: f.write(z.read('ppt/media/image25.png'))
    with open('hand_crops_test/slide17_hand2.png', 'wb') as f: f.write(z.read('ppt/media/image22.png'))
    with open('hand_crops_test/slide17_hand3.png', 'wb') as f: f.write(z.read('ppt/media/image10.png'))
