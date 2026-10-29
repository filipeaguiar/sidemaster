# Let's inspect title crops of slide19_hand1 using PIL
# Since we have slide19_hand1.png (999x219)
# Can we read the text with a quick lightweight python script or inspect the title regions?
from PIL import Image

im = Image.open('hand_crops_test/slide19_hand1.png')
w, h = im.size
print('Image size:', w, h)
