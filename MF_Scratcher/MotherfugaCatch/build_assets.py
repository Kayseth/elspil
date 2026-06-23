import base64
import os

game_dir = os.path.dirname(os.path.abspath(__file__))
assets_root = os.path.dirname(game_dir)

files = {
    'background': os.path.join(assets_root, 'Backgrounds', 'Background_400x800.png'),
    'gameBackground': os.path.join(assets_root, 'Backgrounds', 'LOGO_BG.png'),
    'logo': os.path.join(assets_root, 'LOGO', 'LOGO.png'),
    'van': os.path.join(assets_root, 'Game_ikoner', 'Van_basket.png'),
    'garanti': os.path.join(assets_root, 'Game_ikoner', '42427_Schneider_MF_Scratcher_basket_van_300x300px-02.png'),
    'dansk': os.path.join(assets_root, 'Game_ikoner', '42427_Schneider_MF_Scratcher_basket_van_300x300px-03.png'),
    'losLedning': os.path.join(assets_root, 'Game_ikoner', '42427_Schneider_MF_Scratcher_basket_van_300x300px-05.png'),
}

lines = [
    '/** EmbeddedAssets.js - base64 billeder (virker på mobil uden server) */',
    'const EmbeddedAssets = {'
]

for key, path in files.items():
    if not os.path.isfile(path):
        raise FileNotFoundError(f'Mangler asset: {path}')
    with open(path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('ascii')
    lines.append(f"  {key}: 'data:image/png;base64,{b64}',")

lines.append('};')

out_path = os.path.join(game_dir, 'js', 'utils', 'EmbeddedAssets.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Written', out_path, '- size:', os.path.getsize(out_path), 'bytes')