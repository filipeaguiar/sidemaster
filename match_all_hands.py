from PIL import Image
import glob, os, re, json

# 1. Load all available card templates
templates = {}
for p in glob.glob('card_templates/*.png'):
    name = os.path.splitext(os.path.basename(p))[0]
    # Clean name back to card name
    # e.g. Drossforge_Bridge -> Drossforge Bridge, Black_Mages_Rod -> Black Mage's Rod
    templates[name] = Image.open(p).convert('RGB')

print(f"Loaded {len(templates)} templates: {list(templates.keys())}")
