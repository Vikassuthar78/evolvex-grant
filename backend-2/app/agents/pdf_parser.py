import fitz  # PyMuPDF
import httpx
import re
from typing import Optional

class PDFParser:

    # ── Parse PDF from URL ──
    async def parse_from_url(self, url: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=30) as http:
                response = await http.get(url)
                pdf_bytes = response.content
            return self.parse_bytes(pdf_bytes)
        except Exception as e:
            print(f"PDF URL fetch error: {e}")
            return {"error": str(e), "fields": []}

    # ── Parse PDF from file path ──
    def parse_from_path(self, path: str) -> dict:
        try:
            doc = fitz.open(path)
            return self._extract(doc)
        except Exception as e:
            print(f"PDF parse error: {e}")
            return {"error": str(e), "fields": []}

    # ── Parse PDF from bytes ──
    def parse_bytes(self, pdf_bytes: bytes) -> dict:
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            return self._extract(doc)
        except Exception as e:
            print(f"PDF bytes parse error: {e}")
            return {"error": str(e), "fields": []}

    # ── Core extraction logic ──
    def _extract(self, doc) -> dict:
        fields = []
        full_text = ""

        for page_num, page in enumerate(doc):
            # Extract text
            text = page.get_text()
            full_text += text

            # Extract form widgets (fillable fields)
            for widget in page.widgets() or []:
                field = {
                    "page": page_num + 1,
                    "field_name": widget.field_name or "unnamed",
                    "field_type": widget.field_type_string or "text",
                    "current_value": widget.field_value or "",
                    "required": True,
                    "max_length": widget.text_maxlen or None,
                }
                fields.append(field)

        # If no widgets found, extract fields from text patterns
        if not fields:
            fields = self._extract_text_fields(full_text)

        return {
            "total_pages": len(doc),
            "total_fields": len(fields),
            "fields": fields,
            "raw_text": full_text[:3000],  # first 3000 chars
            "word_limits": self._extract_word_limits(full_text),
            "eligibility": self._extract_eligibility(full_text),
            "deadline": self._extract_deadline(full_text),
        }

    # ── Extract fields from plain text PDFs ──
    def _extract_text_fields(self, text: str) -> list:
        fields = []
        # Common grant form patterns
        patterns = [
            r"Organization Name[:\s]*",
            r"Project Title[:\s]*",
            r"Mission Statement[:\s]*",
            r"Project Description[:\s]*",
            r"Budget[:\s]*",
            r"Team Size[:\s]*",
            r"Location[:\s]*",
            r"Contact Person[:\s]*",
            r"Email[:\s]*",
            r"Phone[:\s]*",
            r"Tax ID[:\s]*",
            r"EIN[:\s]*",
            r"Website[:\s]*",
            r"Project Start Date[:\s]*",
            r"Project End Date[:\s]*",
            r"Amount Requested[:\s]*",
            r"Impact Statement[:\s]*",
            r"Goals and Objectives[:\s]*",
        ]

        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                field_name = re.sub(r"[:\s\*]*$", "", pattern).strip()
                fields.append({
                    "page": 1,
                    "field_name": field_name,
                    "field_type": "text",
                    "current_value": "",
                    "required": True,
                    "max_length": None,
                })

        return fields

    # ── Extract word limits ──
    def _extract_word_limits(self, text: str) -> dict:
        limits = {}
        patterns = [
            (r"(\w[\w\s]*?):\s*(?:max|maximum|limit)[:\s]+(\d+)\s*words", "word"),
            (r"(\w[\w\s]*?):\s*(\d+)\s*words?\s*(?:max|maximum|limit)", "word"),
            (r"(\w[\w\s]*?):\s*(?:max|maximum|limit)[:\s]+(\d+)\s*characters", "char"),
        ]
        for pattern, limit_type in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for field_name, limit in matches:
                limits[field_name.strip()] = {
                    "limit": int(limit),
                    "type": limit_type
                }
        return limits

    # ── Extract eligibility info ──
    def _extract_eligibility(self, text: str) -> str:
        patterns = [
            r"Eligibility[:\s]*(.*?)(?:\n\n|\Z)",
            r"Who can apply[:\s]*(.*?)(?:\n\n|\Z)",
            r"Eligible organizations[:\s]*(.*?)(?:\n\n|\Z)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()[:500]
        return ""

    # ── Extract deadline ──
    def _extract_deadline(self, text: str) -> str:
        patterns = [
            r"Deadline[:\s]*([\w\s,]+\d{4})",
            r"Due Date[:\s]*([\w\s,]+\d{4})",
            r"Submit by[:\s]*([\w\s,]+\d{4})",
            r"Applications due[:\s]*([\w\s,]+\d{4})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return "Not specified"

# Single instance
pdf_parser = PDFParser()