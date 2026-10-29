from PIL import Image
import os, glob

NAME_MAP = {
    'Thoughtcast': 'Thoughtcast',
    'Utrom_Monitor': 'Utrom Monitor',
    'Extract_a_Confession': 'Extract a Confession',
    'Galvanic_Blast': 'Galvanic Blast',
    'Pyroblast': 'Pyroblast',
    'Drossforge_Bridge': 'Drossforge Bridge',
    'Great_Furnace': 'Great Furnace',
    'Nihil_Spellbomb': 'Nihil Spellbomb',
    'Myr_Enforcer': 'Myr Enforcer',
    'Blood_Fountain': 'Blood Fountain',
    'Refurbished_Familiar': 'Refurbished Familiar',
    'Vault_of_Whispers': 'Vault of Whispers',
    'Ichor_Wellspring': 'Ichor Wellspring',
    'Reckoners_Bargain': "Reckoner's Bargain",
    'Sewer-veillance_Cam': 'Sewer-veillance Cam',
    'Mistvault_Bridge': 'Mistvault Bridge',
    'Seat_of_the_Synod': 'Seat of the Synod',
    'Black_Mages_Rod': "Black Mage's Rod",
    'Red_Elemental_Blast': 'Red Elemental Blast',
    'Toxin_Analysis': 'Toxin Analysis',
    'Krark-Clan_Shaman': 'Krark-Clan Shaman',
    'Silverbluff_Bridge': 'Silverbluff Bridge',
    'Makeshift_Munitions': 'Makeshift Munitions',
    'Blue_Elemental_Blast': 'Blue Elemental Blast',
    'Hydroblast': 'Hydroblast',
    'Hydroblast_EMA': 'Hydroblast',
}

tpl_imgs = {}
for k, card_name in NAME_MAP.items():
    p = f'card_templates_inner/{k}.png'
    if os.path.exists(p):
        tpl_imgs[card_name] = Image.open(p).convert('RGB')

def match_card(c):
    c = c.resize((64, 96), Image.Resampling.LANCZOS)
    best_score = float('inf')
    best_name = None
    for name, t_img in tpl_imgs.items():
        diff = 0
        for p1, p2 in zip(c.getdata(), t_img.getdata()):
            diff += (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2
        if diff < best_score:
            best_score = diff
            best_name = name
    return best_name, best_score / (64*96*3)

def match_hand(hand_img_path):
    im = Image.open(hand_img_path).convert('RGB')
    w, h = im.size
    card_w = w / 7.0
    cards = []
    for i in range(7):
        x0 = int((i + 0.05) * card_w)
        x1 = int((i + 0.95) * card_w)
        y0 = int(0.05 * h)
        y1 = int(0.95 * h)
        c = im.crop((x0, y0, x1, y1))
        name, mse = match_card(c)
        cards.append((name, mse))
    return cards

for h_idx in [1, 2, 3]:
    res = match_hand(f'hand_crops_test/slide19_hand{h_idx}.png')
    print(f"Slide 19 Hand {h_idx}:")
    for idx, (name, mse) in enumerate(res):
        print(f"  [{idx}] {name:<22} (mse={mse:.1f})")
