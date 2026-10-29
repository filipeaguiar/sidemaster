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

crop_and_save('hand_crops_test/gen_hand3.png', [
    'Sewer-veillance Cam', 'Utrom Monitor', "Reckoner's Bargain", 'Refurbished Familiar',
    'Galvanic Blast', 'Seat of the Synod', 'Silverbluff Bridge'
])

crop_and_save('hand_crops_test/gen_hand4.png', [
    'Thoughtcast', 'Toxin Analysis', "Reckoner's Bargain", 'Galvanic Blast',
    'Makeshift Munitions', 'Silverbluff Bridge', 'Vault of Whispers'
])
