import os
from typing import Optional

def extract_pdf_text(file_path: str) -> str:
    """Extract text from a PDF file using pdfminer.six with fallback to PyPDF2 or OCR."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    text = ""
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        text = pdfminer_extract(file_path)
    except Exception as e:
        # Fallback to pypdf if available
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            raise ValueError(f"Failed to extract PDF text: {str(e)}")

    text = text.strip()
    if not text:
        # Try OCR fallback if text is empty (scanned PDF)
        from .ocr import extract_ocr_text
        text = extract_ocr_text(file_path)

    return text.strip()

