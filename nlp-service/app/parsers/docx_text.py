import os

def extract_docx_text(file_path: str) -> str:
    """Extract text from a DOCX file, including paragraphs and tables."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    try:
        import docx
        doc = docx.Document(file_path)
        full_text = []

        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())

        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    full_text.append(" | ".join(row_text))

        return "\n".join(full_text).strip()
    except Exception as e:
        raise ValueError(f"Failed to extract DOCX text: {str(e)}")

