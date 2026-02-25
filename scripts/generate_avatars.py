import urllib.request
import re
import os

def download_and_save(url, filename, remove_face=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        svg = response.read().decode('utf-8')
        
    if remove_face:
        # Remove eyes, mouth, eyebrows, nose
        svg = re.sub(r'<g id="Eyes".*?</g>', '', svg, flags=re.DOTALL)
        svg = re.sub(r'<g id="Mouth".*?</g>', '', svg, flags=re.DOTALL)
        svg = re.sub(r'<g id="Eyebrows".*?</g>', '', svg, flags=re.DOTALL)
        svg = re.sub(r'<g id="Nose".*?</g>', '', svg, flags=re.DOTALL)
        
    with open(filename, 'w') as f:
        f.write(svg)

os.makedirs('public/avatars', exist_ok=True)

# 1. Guy with glasses, dark hair
download_and_save('https://api.dicebear.com/7.x/avataaars/svg?seed=1&top=shortWaved&hairColor=2c1b18&accessories=prescription02&clothes=blazerSweater&backgroundColor=e2e8f0', 'public/avatars/1.svg')

# 2. Faceless guy with brown hair, teal shirt, yellow bg
download_and_save('https://api.dicebear.com/7.x/avataaars/svg?seed=2&top=shortFlat&hairColor=4a3123&clothes=collarAndSweater&clothesColor=008080&backgroundColor=fef08a', 'public/avatars/2.svg', remove_face=True)

# 3. Guy with red hair, green hoodie
download_and_save('https://api.dicebear.com/7.x/avataaars/svg?seed=3&top=shortWaved&hairColor=c53131&clothes=hoodie&clothesColor=22543d&backgroundColor=d1fae5', 'public/avatars/3.svg')

# 4. Girl with hijab
download_and_save('https://api.dicebear.com/7.x/avataaars/svg?seed=4&top=hijab&clothes=shirtCrewNeck&clothesColor=e11d48&backgroundColor=fee2e2', 'public/avatars/4.svg')

# 5. Guy with beard
download_and_save('https://api.dicebear.com/7.x/avataaars/svg?seed=5&top=shortRound&facialHair=beardMedium&hairColor=2c1b18&clothes=shirtVNeck&clothesColor=1e3a8a&backgroundColor=dbeafe', 'public/avatars/5.svg')

print("Downloaded 5 avatars.")
