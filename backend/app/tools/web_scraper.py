import logging
import re
from typing import Any
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

SCRAPER_TIMEOUT = 15
ALLOWED_DOMAINS: set[str] = set()
BLOCKED_PATTERNS = [r"\.local$", r"^127\.", r"^192\.168\.", r"^10\.", r"^172\."]


def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False


def is_blocked_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        return any(re.match(pattern, netloc) for pattern in BLOCKED_PATTERNS)
    except Exception:
        return False


def scrape_website(url: str) -> dict[str, Any]:
    """
    Scrape a website and extract structured content.

    Args:
        url: The URL to scrape

    Returns:
        Dictionary with extracted content (title, main_text, links, tables, metadata)
    """
    if not is_valid_url(url):
        return {
            "success": False,
            "error": "Invalid URL format",
            "url": url,
        }

    if is_blocked_url(url):
        return {
            "success": False,
            "error": "Access to this URL is blocked for security reasons",
            "url": url,
        }

    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        }

        response = requests.get(url, headers=headers, timeout=SCRAPER_TIMEOUT)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        title = soup.find("title")
        title_text = title.get_text(strip=True) if title else "No title found"

        for tag in soup(["script", "style", "meta", "link", "noscript"]):
            tag.decompose()

        main_content = None
        for selector in ["article", "main", "[role='main']", ".content", "#content"]:
            main_content = soup.select_one(selector)
            if main_content:
                break

        if main_content is None:
            main_content = soup.body if soup.body else soup

        paragraphs = []
        for p in main_content.find_all("p"):
            text = p.get_text(strip=True)
            if text and len(text) > 20:
                paragraphs.append(text)

        main_text = "\n\n".join(paragraphs[:15])

        links = []
        for a in main_content.find_all("a", href=True):
            href = a["href"]
            text = a.get_text(strip=True)
            if text and len(text) > 2 and not href.startswith("#"):
                links.append({"text": text, "url": href})

        links = links[:10]

        tables = []
        for table in main_content.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cols = []
                for td in tr.find_all(["td", "th"]):
                    cols.append(td.get_text(strip=True))
                if cols:
                    rows.append(cols)
            if rows:
                tables.append(rows[:10])

        tables = tables[:3]

        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")

        metadata = {}
        if og_title:
            metadata["og_title"] = og_title.get("content", "")
        if og_desc:
            metadata["og_description"] = og_desc.get("content", "")
        if og_image:
            metadata["og_image"] = og_image.get("content", "")

        return {
            "success": True,
            "url": url,
            "title": title_text,
            "main_text": main_text,
            "links": links,
            "tables": tables,
            "metadata": metadata,
            "word_count": len(main_text.split()),
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": f"Request timed out after {SCRAPER_TIMEOUT} seconds",
            "url": url,
        }
    except requests.exceptions.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP error: {e.response.status_code}",
            "url": url,
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Request failed: {str(e)}",
            "url": url,
        }
    except Exception as e:
        logger.exception(f"Error scraping {url}")
        return {
            "success": False,
            "error": f"Error during scraping: {str(e)}",
            "url": url,
        }
