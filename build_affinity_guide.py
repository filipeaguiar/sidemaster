import json, uuid, re, zipfile, xml.etree.ElementTree as ET

def new_id(prefix='section'):
    return f'{prefix}_{uuid.uuid4()}'

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

CARD_NAME_NORMALIZATION = {
    'extraction a confession': 'Extract a Confession',
    'extract a confession': 'Extract a Confession',
    'blue  elemental  blast': 'Blue Elemental Blast',
    'blue elemental blast': 'Blue Elemental Blast',
    'red elemental blast': 'Red Elemental Blast',
    'pyroblast': 'Pyroblast',
    'hydroblast': 'Hydroblast',
    'unexpected fangs': 'Unexpected Fangs',
    'krark-clan shaman': 'Krark-Clan Shaman',
    'galvanic blast': 'Galvanic Blast',
    'thoughtcast': 'Thoughtcast',
    "reckoner's bargain": "Reckoner's Bargain",
    'toxin analysis': 'Toxin Analysis',
    'utrom monitor': 'Utrom Monitor',
    'refurbished familiar': 'Refurbished Familiar',
    'myr enforcer': 'Myr Enforcer',
    'blood fountain': 'Blood Fountain',
    'nihil spellbomb': 'Nihil Spellbomb',
    'nihill spellbomb': 'Nihil Spellbomb',
    'sewer-veillance cam': 'Sewer-veillance Cam',
    'ichor wellspring': 'Ichor Wellspring',
    "black mage's rod": "Black Mage's Rod",
    'makeshift munitions': 'Makeshift Munitions',
}

def parse_card_qty_list(items):
    raw_text = ' '.join(items).replace('’', "'")
    tokens = re.findall(r'(\d+)\s+([A-Za-z][A-Za-z\'\s-]+?)(?=\s+\d+\s+[A-Za-z]|$)', raw_text)
    res = []
    for qty, name in tokens:
        n_clean = name.strip()
        canonical = CARD_NAME_NORMALIZATION.get(n_clean.lower(), n_clean)
        res.append(f'{qty} [{canonical}]')
    return '\n'.join(res)

def infer_rating(title, text_pars):
    full_text = ' '.join(text_pars).lower()
    if '50-50' in full_text or 'equilibrad' in full_text:
        return 'Equilibrado'
    if 'muito boa' in full_text or 'ótimo confronto' in full_text or 'ótima partida' in full_text:
        return 'Muito favorável'
    if 'levemente desfavorável' in full_text:
        return 'Levemente desfavorável'
    if 'levemente favorável' in full_text:
        return 'Levemente favorável'
    if 'muito difícil' in full_text or 'muito ruim' in full_text or 'bastante difícil' in full_text:
        return 'Muito desfavorável'
    if 'difícil' in full_text or 'ruim' in full_text or 'desfavorável' in full_text:
        return 'Desfavorável'
    if 'boa' in full_text or 'bom confronto' in full_text or 'favorável' in full_text:
        return 'Favorável'
    return 'Equilibrado'

def classify_hand(text):
    t = text.lower()
    if 'não manteria' in t or 'não a manteria' in t or 'mulligaria' in t or 'mulligan' in t:
        if 'a menos que' in t or 'a não ser que' in t or 'caso' in t or 'se eu' in t:
            return 'Situacional'
        return 'Mulligar'
    elif 'manteria' in t or 'mantenho' in t:
        if 'se eu' in t or 'caso' in t or 'questão de escolha' in t or 'arriscada' in t:
            return 'Situacional'
        return 'Manter'
    return 'Situacional'

def extract_hand_title(text):
    t = text.strip()
    # remove initial 'Essa mão ', 'No caso desta mão, ', etc.
    t_clean = re.sub(r'^(Essa mão|No caso dest[ao] mão,?|Eu também manteria essa mão,?|Eu manteria essa mão,?|Eu não manteria essa mão,?)\s*', '', t, flags=re.IGNORECASE)
    # take first 40 chars or until comma/period
    first_clause = re.split(r'[,.]', t_clean)[0].strip()
    if len(first_clause) > 50:
        first_clause = first_clause[:50] + '…'
    if not first_clause:
        first_clause = 'Exemplo de mão inicial'
    return first_clause[:1].upper() + first_clause[1:]

def build_matchups():
    with zipfile.ZipFile('sources/V.4 PT BR Side Guide Grixis Affinity .pptx') as z:
        slides = sorted([f for f in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', f)],
                        key=lambda x: int(re.search(r'\d+', x).group()))
        pairs = [(s_idx + 1, s_idx + 2) for s_idx in range(17, 97, 2)] + [(98, 100)]

        matchup_nodes = []

        for m_num, h_num in pairs:
            s_m = parse_slide_shapes(z.read(slides[m_num - 1]))
            title = ''
            side_in = []
            side_out = []
            text_pars = []

            for sh in s_m:
                sh_joined = ' '.join(sh)
                if 'Grixis Affinity x' in sh_joined:
                    m = re.search(r'Grixis Affinity\s*[xX]\s*([^\n‹|]+)', sh_joined)
                    if m: title = m.group(1).strip()
                elif any('Side in:' in p or 'Side In:' in p for p in sh):
                    for p in sh:
                        rest = re.sub(r'Side [iI]n:\s*', '', p).strip()
                        if rest: side_in.append(rest)
                elif any('Side out:' in p or 'Side Out:' in p for p in sh):
                    for p in sh:
                        rest = re.sub(r'Side [oO]ut:\s*', '', p).strip()
                        if rest: side_out.append(rest)
                elif not any('link de exemplo' in p or 'lista de exemplo' in p or 'exemplo de lista' in p or '‹#›' in p for p in sh):
                    text_pars.extend(sh)

            # Slide 98 also has slide 99
            if m_num == 98:
                s_99 = parse_slide_shapes(z.read(slides[98]))
                for sh in s_99:
                    if not any('‹#›' in p for p in sh):
                        text_pars.extend(sh)

            parsed_in = parse_card_qty_list(side_in)
            parsed_out = parse_card_qty_list(side_out)

            justification = ''
            strategy_pars = []
            if text_pars:
                first = text_pars[0]
                if any(k in first.lower() for k in ['tiro', 'remov', 'subo', 'motivo', 'não gosto', 'costumo']):
                    justification = first
                    strategy_pars = text_pars[1:]
                else:
                    strategy_pars = text_pars
            strategy = '\n\n'.join(strategy_pars)

            rating = infer_rating(title, text_pars)

            # Hands
            s_h = parse_slide_shapes(z.read(slides[h_num - 1]))
            hand_texts = []
            for sh in s_h:
                for p in sh:
                    if p != '‹#›' and not p.startswith('E bom isso é tudo'):
                        hand_texts.append(p)

            hand_nodes = []
            for h_text in hand_texts:
                dec = classify_hand(h_text)
                h_title = extract_hand_title(h_text)
                hand_node = {
                    'id': new_id('section'),
                    'type': 'hand',
                    'title': h_title,
                    'fields': {
                        'cards': '',
                        'turn': 'Play',
                        'phase': 'Pós-side',
                        'decision': dec,
                        'justification': h_text
                    },
                    'children': []
                }
                hand_nodes.append(hand_node)

            plan_node = {
                'id': new_id('section'),
                'type': 'plan',
                'title': 'Plano geral',
                'fields': {
                    'strategy': strategy,
                    'in': parsed_in,
                    'out': parsed_out,
                    'justification': justification,
                    'interactions': '',
                    'adjustments': '',
                    'rating': rating,
                    'assessment': ''
                },
                'children': []
            }

            variants_node = {
                'id': new_id('section'),
                'type': 'variants',
                'title': 'Variantes',
                'fields': { 'markdown': '' },
                'children': []
            }

            hands_group_node = {
                'id': new_id('section'),
                'type': 'hands',
                'title': 'Mãos iniciais',
                'fields': { 'markdown': '' },
                'children': hand_nodes
            }

            matchup_node = {
                'id': new_id('section'),
                'type': 'matchup',
                'title': title,
                'fields': { 'markdown': '' },
                'children': [plan_node, variants_node, hands_group_node]
            }
            matchup_nodes.append(matchup_node)

        return matchup_nodes

if __name__ == '__main__':
    with open('/home/filipe/Downloads/sidemaster-guides (3).json') as f:
        d = json.load(f)
    v4 = [g for g in d['guides'] if g.get('versionLabel') == 'V4'][0]

    # Existing UB Faeries matchup
    matchups_sec = [s for s in v4['sections'] if s['type'] == 'matchups'][0]
    ub_faerie = matchups_sec['children'][0]

    other_matchups = build_matchups()
    print(f'Generated {len(other_matchups)} other matchups.')

    # Combine UB Faerie + all other matchups
    all_matchups = [ub_faerie] + other_matchups
    matchups_sec['children'] = all_matchups
    print(f'Total matchups in guide: {len(all_matchups)}')

    # Write output to sidemaster-grixis-v4-full.json
    envelope = {
        'schemaVersion': 2,
        'guides': [v4]
    }
    with open('sidemaster-grixis-v4-full.json', 'w', encoding='utf-8') as out:
        json.dump(envelope, out, indent=2, ensure_ascii=False)
    print('Saved to sidemaster-grixis-v4-full.json successfully.')
