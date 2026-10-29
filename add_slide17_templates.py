from PIL import Image

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

crop_and_save('hand_crops_test/slide17_hand1.png', [
    'Thoughtcast', 'Thoughtcast', 'Blood Fountain', "Reckoner's Bargain",
    'Galvanic Blast', 'Great Furnace', 'Vault of Whispers'
])

crop_and_save('hand_crops_test/slide17_hand2.png', [
    'Sewer-veillance Cam', 'Pyroblast', 'Pyroblast', 'Mistvault Bridge',
    'Seat of the Synod', 'Vault of Whispers', 'Vault of Whispers'
])

crop_and_save('hand_crops_test/slide17_hand3.png', [
    "Black Mage's Rod", "Reckoner's Bargain", 'Refurbished Familiar',
    'Pyroblast', 'Red Elemental Blast', 'Drossforge Bridge', 'Ichor Wellspring'
])
