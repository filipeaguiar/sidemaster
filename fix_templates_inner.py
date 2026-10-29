from PIL import Image
import os, glob

os.makedirs('card_templates_inner', exist_ok=True)

def save_inner(img_path, card_idx, card_name):
    im = Image.open(img_path).convert('RGB')
    w, h = im.size
    card_w = w / 7.0
    x0 = int((card_idx + 0.05) * card_w)
    x1 = int((card_idx + 0.95) * card_w)
    y0 = int(0.05 * h)
    y1 = int(0.95 * h)
    c = im.crop((x0, y0, x1, y1)).resize((64, 96), Image.Resampling.LANCZOS)
    safe_name = card_name.replace(' ', '_').replace("'", '')
    c.save(f"card_templates_inner/{safe_name}.png")

# Slide 19 Hand 1:
save_inner('hand_crops_test/slide19_hand1.png', 0, 'Thoughtcast')
save_inner('hand_crops_test/slide19_hand1.png', 1, 'Utrom Monitor')
save_inner('hand_crops_test/slide19_hand1.png', 2, 'Extract a Confession')
save_inner('hand_crops_test/slide19_hand1.png', 3, 'Galvanic Blast')
save_inner('hand_crops_test/slide19_hand1.png', 4, 'Pyroblast')
save_inner('hand_crops_test/slide19_hand1.png', 5, 'Drossforge Bridge')

# Slide 19 Hand 2:
save_inner('hand_crops_test/slide19_hand2.png', 3, 'Great Furnace')
save_inner('hand_crops_test/slide19_hand2.png', 5, 'Nihil Spellbomb')
save_inner('hand_crops_test/slide19_hand2.png', 6, 'Myr Enforcer')

# Slide 19 Hand 3:
save_inner('hand_crops_test/slide19_hand3.png', 0, 'Blood Fountain')
save_inner('hand_crops_test/slide19_hand3.png', 1, 'Refurbished Familiar')
save_inner('hand_crops_test/slide19_hand3.png', 4, 'Vault of Whispers')
save_inner('hand_crops_test/slide19_hand3.png', 6, 'Ichor Wellspring')

# Slide 17 Hand 1:
save_inner('hand_crops_test/slide17_hand1.png', 3, "Reckoner's Bargain")

# Slide 17 Hand 2:
save_inner('hand_crops_test/slide17_hand2.png', 0, 'Sewer-veillance Cam')
save_inner('hand_crops_test/slide17_hand2.png', 3, 'Mistvault Bridge')
save_inner('hand_crops_test/slide17_hand2.png', 4, 'Seat of the Synod')

# Slide 17 Hand 3:
save_inner('hand_crops_test/slide17_hand3.png', 0, "Black Mage's Rod")
save_inner('hand_crops_test/slide17_hand3.png', 4, 'Red Elemental Blast')

# Gen Hand 2:
save_inner('hand_crops_test/gen_hand2.png', 1, 'Toxin Analysis')
save_inner('hand_crops_test/gen_hand2.png', 3, 'Krark-Clan Shaman')

# Gen Hand 3 / 4:
save_inner('hand_crops_test/gen_hand3.png', 6, 'Silverbluff Bridge')
save_inner('hand_crops_test/gen_hand4.png', 4, 'Makeshift Munitions')

# Slide 47 Hand 1:
save_inner('hand_crops_all/slide47_hand1.png', 0, 'Blue Elemental Blast')

# Slide 47 Hand 2:
save_inner('hand_crops_all/slide47_hand2.png', 0, 'Hydroblast')

# Slide 51 Hand 2:
save_inner('hand_crops_all/slide51_hand2.png', 0, 'Hydroblast_EMA')
