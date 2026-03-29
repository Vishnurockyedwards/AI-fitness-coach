from __future__ import annotations

from pathlib import Path

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS


def index_exists(index_dir: str | Path) -> bool:
    """
    FAISS.save_local writes:
    - index.faiss
    - index.pkl
    """
    p = Path(index_dir)
    return (p / "index.faiss").exists() and (p / "index.pkl").exists()


def build_faiss_index(
    chunks: list[Document],
    embeddings,
) -> FAISS:
    if not chunks:
        raise ValueError("No chunks provided to build the FAISS index.")
    return FAISS.from_documents(chunks, embeddings)


def save_faiss_index(store: FAISS, index_dir: str | Path) -> None:
    p = Path(index_dir)
    p.mkdir(parents=True, exist_ok=True)
    store.save_local(str(p))


def load_faiss_index(index_dir: str | Path, embeddings) -> FAISS:
    # FAISS.load_local uses pickle for the docstore, so LangChain requires an explicit opt-in.
    return FAISS.load_local(
        str(Path(index_dir)),
        embeddings,
        allow_dangerous_deserialization=True,
    )

