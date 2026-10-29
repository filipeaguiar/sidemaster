from PIL import Image
import os, glob

# Clean up card_templates
for f in glob.glob('card_templates/*.png'):
    os.remove(f)

def save_crop(img_path, card_idx, card_name):
    im = Image.open(img_path).convert('RGB')
    w, h = im.size
    card_w = w / 7.0
    c = im.crop((int(card_idx*card_w), 0, int((card_idx+1)*card_w), h))
    safe_name = card_name.replace(' ', '_').replace("'", '')
    save_path = f"card_templates/{safe_name}.png"
    c.save(save_path)
    print(f"Saved exact template for {card_name}")

# Slide 19 Hand 1:
# 0: Thoughtcast
# 1: Utrom Monitor
# 2: Extract a Confession
# 3: Galvanic Blast
# 4: Pyroblast
# 5: Drossforge Bridge
# (Drossforge Bridge is also 6)
save_crop('hand_crops_test/slide19_hand1.png', 0, 'Thoughtcast')
save_crop('hand_crops_test/slide19_hand1.png', 1, 'Utrom Monitor')
save_crop('hand_crops_test/slide19_hand1.png', 2, 'Extract a Confession')
save_crop('hand_crops_test/slide19_hand1.png', 3, 'Galvanic Blast')
save_crop('hand_crops_test/slide19_hand1.png', 4, 'Pyroblast')
save_crop('hand_crops_test/slide19_hand1.png', 5, 'Drossforge Bridge')

# Slide 19 Hand 2:
# 3: Great Furnace
# 5: Nihil Spellbomb
# 6: Myr Enforcer
save_crop('hand_crops_test/slide19_hand2.png', 3, 'Great Furnace')
save_crop('hand_crops_test/slide19_hand2.png', 5, 'Nihil Spellbomb')
save_crop('hand_crops_test/slide19_hand2.png', 6, 'Myr Enforcer')

# Slide 19 Hand 3:
# 0: Blood Fountain
# 1: Refurbished Familiar
# 4: Vault of Whispers
# 6: Ichor Wellspring
save_crop('hand_crops_test/slide19_hand3.png', 0, 'Blood Fountain')
save_crop('hand_crops_test/slide19_hand3.png', 1, 'Refurbished Familiar')
save_crop('hand_crops_test/slide19_hand3.png', 4, 'Vault of Whispers')
save_crop('hand_crops_test/slide19_hand3.png', 6, 'Ichor Wellspring')

# Slide 17 Hand 1:
# 3: Reckoner's Bargain
save_crop('hand_crops_test/slide17_hand1.png', 3, "Reckoner's Bargain")

# Slide 17 Hand 2:
# 0: Sewer-veillance Cam
# 3: Mistvault Bridge
# 4: Seat of the Synod
save_crop('hand_crops_test/slide17_hand2.png', 0, 'Sewer-veillance Cam')
save_crop('hand_crops_test/slide17_hand2.png', 3, 'Mistvault Bridge')
save_crop('hand_crops_test/slide17_hand2.png', 4, 'Seat of the Synod')

# Slide 17 Hand 3:
# 0: Black Mage's Rod
# 4: Red Elemental Blast
save_crop('hand_crops_test/slide17_hand3.png', 0, "Black Mage's Rod")
save_crop('hand_crops_test/slide17_hand3.png', 4, 'Red Elemental Blast')

# Gen Hand 2 (slide 4/5):
# 1: Toxin Analysis
# 3: Krark-Clan Shaman
save_crop('hand_crops_test/gen_hand2.png', 1, 'Toxin Analysis')
save_crop('hand_crops_test/gen_hand2.png', 3, 'Krark-Clan Shaman')

# Gen Hand 3 / 4:
# 6: Silverbluff Bridge
# 4: Makeshift Munitions
save_crop('hand_crops_test/gen_hand3.png', 6, 'Silverbluff Bridge')
save_crop('hand_crops_test/gen_hand4.png', 4, 'Makeshift Munitions')

# Slide 47 Hand 1:
# 0: Blue Elemental Blast
save_crop('hand_crops_all/slide47_hand1.png', 0, 'Blue Elemental Blast')

# Slide 47 Hand 2:
# 0: Hydroblast
save_crop('hand_crops_all/slide47_hand2.png', 0, 'Hydroblast')

# Slide 51 Hand 2:
# 0: Hydroblast (EMA)
save_crop('hand_crops_all/slide51_hand2.png', 0, 'Hydroblast_EMA')
