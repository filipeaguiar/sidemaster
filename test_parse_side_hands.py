import zipfile, xml.etree.ElementTree as ET, re

# Let's inspect slide 18, 20, 22
with zipfile.ZipFile('sources/V.4 PT BR Side Guide Grixis Affinity .pptx') as z:
    for s_idx in [17, 19, 21]:
        s_num = s_idx + 1
        root = ET.fromstring(z.read(f'ppt/slides/slide{s_num}.xml'))
        namespaces = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                       'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
        print(f"=== SLIDE {s_num} ===")
        for sp in root.findall('.//p:sp', namespaces):
            tx = sp.find('.//p:txBody', namespaces)
            if tx is not None:
                pars = [''.join([e.text for e in p.findall('.//a:t', namespaces) if e.text]) for p in tx.findall('.//a:p', namespaces)]
                print('Shape:', ' // '.join(pars[:3]))
