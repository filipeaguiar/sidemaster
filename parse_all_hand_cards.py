import zipfile, xml.etree.ElementTree as ET, re, os, io
from PIL import Image

# Known deck cards for Grixis Affinity V4
# Main:
# 2 Blood Fountain, 2 Nihil Spellbomb, 1 Sewer-veillance Cam, 4 Ichor Wellspring, 3 Black Mage's Rod
# 1 Makeshift Munitions, 4 Galvanic Blast, 4 Thoughtcast, 4 Reckoner's Bargain, 2 Toxin Analysis
# 3 Utrom Monitor, 3 Krark-Clan Shaman, 4 Refurbished Familiar, 4 Myr Enforcer
# 2 Seat of the Synod, 4 Vault of Whispers, 2 Great Furnace, 1 Mountain, 2 Silverbluff Bridge, 4 Drossforge Bridge, 4 Mistvault Bridge
# Side:
# 2 Blue Elemental Blast, 4 Hydroblast, 1 Red Elemental Blast, 4 Pyroblast, 1 Unexpected Fangs, 2 Extract a Confession, 1 Krark-Clan Shaman

# Total distinct cards:
# Blood Fountain, Nihil Spellbomb, Sewer-veillance Cam, Ichor Wellspring, Black Mage's Rod,
# Makeshift Munitions, Galvanic Blast, Thoughtcast, Reckoner's Bargain, Toxin Analysis,
# Utrom Monitor, Krark-Clan Shaman, Refurbished Familiar, Myr Enforcer,
# Seat of the Synod, Vault of Whispers, Great Furnace, Mountain, Silverbluff Bridge, Drossforge Bridge, Mistvault Bridge,
# Blue Elemental Blast, Hydroblast, Red Elemental Blast, Pyroblast, Unexpected Fangs, Extract a Confession

print("Card catalog ready.")
