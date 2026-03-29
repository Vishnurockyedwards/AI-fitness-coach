from __future__ import annotations

from langchain_core.documents import Document


def retrieve_top_k(store, query: str, k: int = 3) -> list[Document]:
    """
    Retrieve the top-k most relevant chunks for a query.

    Requirement default: top 3.
    """
    query = (query or "").strip()
    if not query:
        return []
    return store.similarity_search(query, k=k)

