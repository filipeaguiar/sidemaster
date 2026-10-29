from PIL import Image
import glob, os

# Canonical card names mapping from template filename
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

# Pre-resize all templates to (64, 96) for fast, highly accurate comparison
tpl_imgs = {}
for k, card_name in NAME_MAP.items():
    p = f'card_templates/{k}.png'
    if os.path.exists(p):
        im = Image.open(p).convert('RGB').resize((64, 96), Image.Resampling.LANCZOS)
        tpl_imgs[card_name] = im

def match_card(crop_img):
    c = crop_img.convert('RGB').resize((64, 96), Image.Resampling.LANCZOS)
    p_crop = list(c.getdata())
    best_score = float('inf')
    best_name = None
    for name, t_img in tpl_imgs.items():
        p_tpl = list(t_img.getdata())
        mse = sum((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2 for c1, c2 in zip(p_crop, p_tpl))
        if mse < best_score:
            best_score = mse
            best_name = name
    return best_name, best_score / (64*96*3)

def match_hand(hand_img_path):
    im = Image.open(hand_img_path).convert('RGB')
    w, h = im.size
    card_w = w / 7.0
    cards = []
    for i in range(7):
        c = im.crop((int(i*card_w), 0, int((i+1)*card_w), h))
        name, mse = match_card(c)
        cards.append((name, mse))
    return cards

# Test on slide 19 hands
for h_idx in [1, 2, 3]:
    res = match_hand(f'hand_crops_test/slide19_hand{h_idx}.png')
    print(f"Slide 19 Hand {h_idx}:")
    for idx, (name, mse) in enumerate(res):
        print(f"  [{idx}] {name:<22} (mse={mse:.1f})")
