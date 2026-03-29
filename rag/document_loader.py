from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from langchain_core.documents import Document


@dataclass(frozen=True)
class LoadedKnowledgeBase:
    documents: list[Document]
    loaded_paths: list[Path]
    skipped_paths: list[Path]


def _load_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _load_pdf(path: Path) -> str:
    # Import lazily so the rest of the system works without PDFs.
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            parts.append(text)
    return "\n\n".join(parts).strip()


def load_documents(knowledge_base_dir: str | Path) -> LoadedKnowledgeBase:
    """
    Load all documents from the knowledge base directory.

    Supported:
    - .txt
    - .pdf
    """
    kb_dir = Path(knowledge_base_dir)
    if not kb_dir.exists() or not kb_dir.is_dir():
        raise FileNotFoundError(f"Knowledge base directory not found: {kb_dir}")

    documents: list[Document] = []
    loaded_paths: list[Path] = []
    skipped_paths: list[Path] = []

    for path in sorted(kb_dir.rglob("*")):
        if not path.is_file():
            continue

        suffix = path.suffix.lower()
        try:
            if suffix == ".txt":
                text = _load_txt(path)
            elif suffix == ".pdf":
                text = _load_pdf(path)
            else:
                skipped_paths.append(path)
                continue
        except Exception:
            # If a single file is corrupted, skip it rather than failing the whole pipeline.
            skipped_paths.append(path)
            continue

        text = (text or "").strip()
        if not text:
            skipped_paths.append(path)
            continue

        documents.append(
            Document(
                page_content=text,
                metadata={
                    "source": str(path),
                    "filename": path.name,
                    "filetype": suffix.lstrip("."),
                },
            )
        )
        loaded_paths.append(path)

    return LoadedKnowledgeBase(
        documents=documents, loaded_paths=loaded_paths, skipped_paths=skipped_paths
    )


def pretty_sources(docs: Iterable[Document]) -> list[str]:
    """Utility for UIs: return unique 'source' strings in order."""
    seen: set[str] = set()
    sources: list[str] = []
    for d in docs:
        src = str(d.metadata.get("source", "")).strip()
        if src and src not in seen:
            seen.add(src)
            sources.append(src)
    return sources

