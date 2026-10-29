from PIL import Image

# For any MTG card image of size (w, h):
# The art box is located at:
# x: 12% to 88% of card width
# y: 12% to 54% of card height
# Let's crop just the art box of debug_c0 and compare with art box of slide19_hand1 card 2!

im1 = Image.open('hand_crops_test/slide19_hand1.png').convert('RGB')
w1, h1 = im1.size
card_w1 = w1 / 7.0
# card 2 of hand 1 is Extract a Confession
c_ref = im1.crop((int(2*card_w1 + 0.12*card_w1), int(0.12*h1), int(2*card_w1 + 0.88*card_w1), int(0.54*h1))).resize((64, 64))

im2 = Image.open('hand_crops_test/slide19_hand2.png').convert('RGB')
w2, h2 = im2.size
card_w2 = w2 / 7.0
# card 0 of hand 2 is also Extract a Confession
c_target = im2.crop((int(0*card_w2 + 0.12*card_w2), int(0.12*h2), int(0*card_w2 + 0.88*card_w2), int(0.54*h2))).resize((64, 64))

# card 1 of hand 2 is Galvanic Blast
c_galv = im2.crop((int(1*card_w2 + 0.12*card_w2), int(0.12*h2), int(1*card_w2 + 0.88*card_w2), int(0.54*h2))).resize((64, 64))

def mse(a, b):
    return sum((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2 for p1, p2 in zip(a.getdata(), b.getdata())) / (64*64*3)

print('MSE between same card (Extract a Confession in hand 1 and hand 2):', mse(c_ref, c_target))
print('MSE between different cards (Extract a Confession and Galvanic Blast):', mse(c_ref, c_galv))
