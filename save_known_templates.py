from PIL import Image
import os

os.makedirs('card_templates', exist_ok=True)

def crop_and_save(img_path, card_names):
    im = Image.open(img_path).convert('RGB')
    w, h = im.size
    card_w = w / 7.0
    for i, name in enumerate(card_names):
        c = im.crop((int(i*card_w), 0, int((i+1)*card_w), h))
        safe_name = name.replace(' ', '_').replace("'", '')
        save_name = f"card_templates/{safe_name}.png"
        c.save(save_name)
        print(f"Saved template for {name}")

crop_and_save('hand_crops_test/slide19_hand1.png', [
    'Thoughtcast', 'Utrom Monitor', 'Extract a Confession', 'Galvanic Blast',
    'Pyroblast', 'Drossforge Bridge', 'Drossforge Bridge'
])
crop_and_save('hand_crops_test/slide19_hand2.png', [
    'Extract a Confession', 'Galvanic Blast', 'Galvanic Blast', 'Great Furnace',
    'Great Furnace', 'Nihil Spellbomb', 'Myr Enforcer'
])
crop_and_save('hand_crops_test/slide19_hand3.png', [
    'Blood Fountain', 'Refurbished Familiar', 'Refurbished Familiar', 'Pyroblast',
    'Vault of Whispers', 'Nihil Spellbomb', 'Ichor Wellspring'
])
