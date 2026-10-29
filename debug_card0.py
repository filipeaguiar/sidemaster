from PIL import Image

im = Image.open('hand_crops_test/slide19_hand2.png')
# Card 0 is Extract a Confession
w, h = im.size
card_w = w / 7.0
c0 = im.crop((int(0.05*card_w), int(0.05*h), int(0.95*card_w), int(0.95*h))).convert('RGB').resize((64, 96))

# Compare with Extract a Confession template
t_extract = Image.open('card_templates_inner/Extract_a_Confession.png').convert('RGB')
diff_ext = sum((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2 for p1, p2 in zip(c0.getdata(), t_extract.getdata())) / (64*96*3)

t_rod = Image.open('card_templates_inner/Black_Mages_Rod.png').convert('RGB')
diff_rod = sum((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2 for p1, p2 in zip(c0.getdata(), t_rod.getdata())) / (64*96*3)

print('diff Extract a Confession:', diff_ext)
print('diff Black Mages Rod:', diff_rod)
