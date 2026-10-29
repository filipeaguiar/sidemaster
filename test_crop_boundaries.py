from PIL import Image

# In slide 19 hand 2:
# Width is 1002, height is 230.
# In slide 19 hand 1:
# Width is 999, height is 219.
# The template was cropped using hand 1's height (219), but hand 2's height is 230!
# Also, cards have a 1px or 2px black border!
# If we crop the interior of each card (e.g. 5% to 95% of width, 5% to 95% of height),
# we avoid boundary differences completely!
