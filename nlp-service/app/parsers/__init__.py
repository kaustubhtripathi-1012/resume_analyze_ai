"""Resume file text parsers."""
from .pdf_text import extract_pdf_text
from .docx_text import extract_docx_text
from .ocr import extract_ocr_text

__all__ = ["extract_pdf_text", "extract_docx_text", "extract_ocr_text"]

