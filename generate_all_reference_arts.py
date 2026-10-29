import urllib.request, json, time, os, urllib.parse

os.makedirs('all_card_arts', exist_ok=True)

deck_cards = [
    'Blood Fountain', 'Nihil Spellbomb', 'Sewer-veillance Cam', 'Ichor Wellspring',
    "Black Mage's Rod", 'Makeshift Munitions', 'Galvanic Blast', 'Thoughtcast',
    "Reckoner's Bargain", 'Toxin Analysis', 'Utrom Monitor', 'Krark-Clan Shaman',
    'Refurbished Familiar', 'Myr Enforcer', 'Seat of the Synod', 'Vault of Whispers',
    'Great Furnace', 'Mountain', 'Silverbluff Bridge', 'Drossforge Bridge', 'Mistvault Bridge',
    'Blue Elemental Blast', 'Hydroblast', 'Red Elemental Blast', 'Pyroblast',
    'Unexpected Fangs', 'Extract a Confession'
]

headers = {'User-Agent': 'Sidemaster/1.0', 'Accept': 'application/json'}

for card_name in deck_cards:
    query = f'!"{card_name}" include:extras'
    url = f'https://api.scryfall.com/cards/search?q={urllib.parse.quote(query)}&unique=prints'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f'{card_name}: found {len(data["data"])} printings')
            for p in data['data']:
                set_code = p['set']
                art_url = p.get('image_uris', {}).get('art_crop')
                if not art_url and 'card_faces' in p:
                    art_url = p['card_faces'][0].get('image_uris', {}).get('art_crop')
                if art_url:
                    clean_name = card_name.replace("'", "").replace('/', '_')
                    save_path = f'all_card_arts/{clean_name}__{set_code}.jpg'
                    if not os.path.exists(save_path):
                        img_req = urllib.request.Request(art_url, headers=headers)
                        with urllib.request.urlopen(img_req) as img_resp:
                            with open(save_path, 'wb') as out_f:
                                out_f.write(img_resp.read())
                        time.sleep(0.08)
    except Exception as e:
        print(f'Error for {card_name}: {e}')
    time.sleep(0.1)

print('Done collecting all card art printings.')
