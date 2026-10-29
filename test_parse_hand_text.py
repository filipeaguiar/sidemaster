import zipfile, xml.etree.ElementTree as ET, re

# Let's inspect all 41 hand slides text paragraphs
def parse_slide_shapes(xml_content):
    root = ET.fromstring(xml_content)
    namespaces = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                   'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
    shapes = []
    for sp in root.findall('.//p:sp', namespaces):
        txBody = sp.find('.//p:txBody', namespaces)
        if txBody is not None:
            pars = []
            for p in txBody.findall('.//a:p', namespaces):
                t = ''.join([e.text for e in p.findall('.//a:t', namespaces) if e.text])
                if t.strip(): pars.append(t.strip())
            if pars: shapes.append(pars)
    return shapes

with zipfile.ZipFile('sources/V.4 PT BR Side Guide Grixis Affinity .pptx') as z:
    slides = sorted([f for f in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', f)],
                    key=lambda x: int(re.search(r'\d+', x).group()))

    pairs = [(s_idx + 1, s_idx + 2) for s_idx in range(17, 97, 2)] + [(98, 100)]
    for m_num, h_num in pairs[:10]:
        s_h = parse_slide_shapes(z.read(slides[h_num - 1]))
        print(f"=== HANDS SLIDE {h_num} ===")
        for sh in s_h:
            for p in sh:
                print('  PAR:', p[:100])
