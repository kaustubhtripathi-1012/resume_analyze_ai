import os

def extract_ocr_text(file_path: str) -> str:
    """Fallback OCR text extraction using pytesseract and pdf2image/Pillow."""
    try:
        import pytesseract
        from PIL import Image

        # If it's an image file directly
        ext = os.path.splitext(file_path)[1].lower()
        if ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            image = Image.open(file_path)
            return pytesseract.image_to_string(image)

        # For PDF files, attempt using pdf2image if installed
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(file_path, first_page=1, last_page=3)
            ocr_text = []
            for img in images:
                ocr_text.append(pytesseract.image_to_string(img))
            return "\n".join(ocr_text).strip()
        except ImportError:
            return ""
    except Exception:
        return ""

