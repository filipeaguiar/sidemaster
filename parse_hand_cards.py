import zipfile, xml.etree.ElementTree as ET, posixpath, re

with zipfile.ZipFile('sources/V.4 PT BR Side Guide Grixis Affinity .pptx') as z:
    slides = sorted([f for f in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', f)],
                    key=lambda x: int(re.search(r'\d+', x).group()))

    # Check slide 19 (UB Terror hands)
    rels_content = z.read('ppt/slides/_rels/slide19.xml.rels')
    root_rels = ET.fromstring(rels_content)
    rids = {r.attrib['Id']: r.attrib['Target'] for r in root_rels}

    slide_content = z.read('ppt/slides/slide19.xml')
    root_slide = ET.fromstring(slide_content)
    namespaces = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                   'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}

    for p in root_slide.findall('.//p:pic', namespaces):
        blip = p.find('.//a:blip', namespaces)
        rid = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        target = rids.get(rid)
        off = p.find('.//a:off', namespaces)
        y = off.attrib.get('y') if off is not None else None
        print(f'Pic target={target} at y={y}')
