"""Package current source files after npm run build."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import shutil
root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
output = root / '배포'
upload = output / '깃허브에-올릴-파일'
items = ['src', 'public', 'tests', 'scripts/package.py', '.github', '.gitignore', '.prettierrc.json', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'README.md', 'MAINTENANCE.md', 'UPLOAD.md', 'TEST-RESULTS.md']
assert (root / 'dist/sw.js').is_file(), 'Run npm run build first.'
output.mkdir(exist_ok=True)
if upload.exists():
    raise SystemExit('Upload folder already exists. Rename it before packaging again.')
upload.mkdir()
for item in items:
    source = root / item
    target = upload / item
    if source.is_dir():
        shutil.copytree(source, target)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
zip_path = output / f'차곡-v{version}-깃허브업로드.zip'
with ZipFile(zip_path, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(upload.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(upload).as_posix())
with ZipFile(zip_path) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert '.github/workflows/deploy.yml' in names
    assert 'src/App.tsx' in names and 'src/pages/TodayPage.tsx' in names
    assert not any(n.startswith(('node_modules/', '_archive/', 'dist/')) for n in names)
print(f'Packaged {len(names)} files, {zip_path.stat().st_size:,} bytes.')
