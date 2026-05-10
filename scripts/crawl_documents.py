"""
Crawl tài liệu kỹ thuật từ duocmua.vn
Output:
  scripts/data/documents.json           — metadata tài liệu
  scripts/data/documents/               — file PDF đã download
"""

import html as html_module
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE_URL = "https://www.duocmua.vn"
PAPER_URL = f"{BASE_URL}/vn/tailieu"
VIDEO_URL = f"{BASE_URL}/vn/tailieuvideo"
OUT_DIR = Path(__file__).parent / "data"
DOC_DIR = OUT_DIR / "documents"
OUT_DIR.mkdir(exist_ok=True)
DOC_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "vi-VN,vi;q=0.9",
}


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")


def safe_filename(name: str) -> str:
    return re.sub(r"[^\w.\-]", "_", urllib.parse.unquote(name))


def download_file(url: str, dest_dir: Path) -> str | None:
    try:
        # Encode spaces and special chars in URL path
        parsed = urllib.parse.urlparse(url)
        encoded_path = urllib.parse.quote(parsed.path)
        url = urllib.parse.urlunparse(parsed._replace(path=encoded_path))

        filename = safe_filename(urllib.parse.unquote(parsed.path.split("/")[-1]))
        dest = dest_dir / filename
        if dest.exists():
            print(f"    EXISTS {filename}")
            return f"documents/{filename}"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=60) as r:
            dest.write_bytes(r.read())
        size_kb = dest.stat().st_size // 1024
        print(f"    OK {filename} ({size_kb} KB)")
        return f"documents/{filename}"
    except Exception as e:
        print(f"    FAIL {url}: {e}")
        return None


def slugify(text: str) -> str:
    replacements = [
        ("àáạảãâầấậẩẫăằắặẳẵ", "a"), ("èéẹẻẽêềếệểễ", "e"),
        ("ìíịỉĩ", "i"), ("òóọỏõôồốộổỗơờớợởỡ", "o"),
        ("ùúụủũưừứựửữ", "u"), ("ỳýỵỷỹ", "y"), ("đ", "d"),
    ]
    result = text.lower().strip()
    for chars, rep in replacements:
        for ch in chars:
            result = result.replace(ch, rep)
    result = re.sub(r"[^a-z0-9]+", "-", result)
    return result.strip("-")[:200]


def parse_paper_page(html: str) -> list[dict]:
    """Trích title, date, pdf_url từ HTML trang /vn/tailieu."""
    # Extract sidebar items: <li class="list-group-item">
    sidebar_titles = re.findall(
        r'<h5[^>]*>\s*(.+?)\s*</h5>', html, re.DOTALL
    )
    sidebar_dates = re.findall(
        r'class="list-group-item"[^>]*>.*?<small[^>]*>([^<]+)</small>',
        html, re.DOTALL
    )
    pdf_urls = re.findall(
        r'["\'](/media/[^"\']*\.pdf)["\']', html
    )

    # Fallback: extract dates from list-group-item blocks
    if not sidebar_dates:
        blocks = re.findall(
            r'class="list-group-item"[^>]*>(.*?)</li>', html, re.DOTALL
        )
        for block in blocks:
            date_match = re.search(r'(\d{1,2}/\d{1,2}/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M)', block)
            sidebar_dates.append(date_match.group(1) if date_match else "")

    results = []
    for i, pdf_url in enumerate(pdf_urls):
        title = html_module.unescape(sidebar_titles[i].strip()) if i < len(sidebar_titles) else f"Document {i+1}"
        title = re.sub(r'\s+', ' ', title)
        date = sidebar_dates[i].strip() if i < len(sidebar_dates) else ""
        results.append({
            "title": title,
            "slug": slugify(title),
            "date": date,
            "pdf_url": BASE_URL + pdf_url,
            "doc_type": "paper",
        })

    return results


def parse_video_page(html: str) -> list[dict]:
    """Trích title, date, video_url từ HTML trang /vn/tailieuvideo."""
    # YouTube embed URLs
    video_urls = re.findall(
        r'(?:youtube\.com/embed/|youtu\.be/)([A-Za-z0-9_\-]{11})', html
    )
    # Also check iframe src
    iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    yt_iframes = [u for u in iframes if "youtube" in u or "youtu.be" in u]

    sidebar_titles = re.findall(r'<h5[^>]*>\s*(.+?)\s*</h5>', html, re.DOTALL)
    sidebar_dates = re.findall(
        r'(\d{1,2}/\d{1,2}/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M)', html
    )

    results = []
    combined_urls = list(dict.fromkeys(yt_iframes + [f"https://www.youtube.com/watch?v={v}" for v in video_urls]))

    for i, vid_url in enumerate(combined_urls):
        title = html_module.unescape(sidebar_titles[i].strip()) if i < len(sidebar_titles) else f"Video {i+1}"
        title = re.sub(r'\s+', ' ', title)
        date = sidebar_dates[i].strip() if i < len(sidebar_dates) else ""
        results.append({
            "title": title,
            "slug": slugify(title),
            "date": date,
            "video_url": vid_url,
            "doc_type": "video",
        })

    return results


def main():
    documents = []

    # === PAPER DOCUMENTS ===
    print("Fetching paper documents page...")
    paper_html = fetch_html(PAPER_URL)
    papers = parse_paper_page(paper_html)
    print(f"  Found {len(papers)} paper documents")

    for i, doc in enumerate(papers, 1):
        print(f"[{i:02d}/{len(papers)}] {doc['title'][:60]}")
        local_path = download_file(doc["pdf_url"], DOC_DIR)
        doc["file"] = local_path
        documents.append(doc)

    # === VIDEO DOCUMENTS ===
    print(f"\nFetching video documents page...")
    try:
        video_html = fetch_html(VIDEO_URL)
        videos = parse_video_page(video_html)
        print(f"  Found {len(videos)} video documents")
        for i, doc in enumerate(videos, 1):
            print(f"[{i:02d}/{len(videos)}] {doc['title'][:60]}")
            print(f"    URL: {doc.get('video_url', '')}")
        documents.extend(videos)
    except Exception as e:
        print(f"  FAIL video page: {e}")

    # Save JSON
    out_file = OUT_DIR / "documents.json"
    out_file.write_text(json.dumps(documents, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nXong! Da luu {len(documents)} tai lieu -> {out_file}")
    print(f"  PDF -> {DOC_DIR}")


if __name__ == "__main__":
    main()
