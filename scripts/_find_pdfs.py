import urllib.request, re

req = urllib.request.Request(
    'https://www.duocmua.vn/vn/tailieu',
    headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'vi-VN,vi;q=0.9'}
)
with urllib.request.urlopen(req, timeout=15) as r:
    html = r.read().decode('utf-8', errors='replace')

pdfs = re.findall(r'["\'](/media/[^"\']*\.pdf[^"\']*)["\']', html)
print(f'PDF URLs found: {len(pdfs)}')
for p in pdfs:
    print(' ', p)

print(f'\nHTML length: {len(html)}')
# Also find any document-related data
doc_data = re.findall(r'(loadDocument|setPdf|pdfUrl|docUrl|pdf_url)[^;]{0,200}', html, re.IGNORECASE)
for d in doc_data[:5]:
    print('  DATA:', d[:200])
