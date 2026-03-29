from __future__ import annotations

from langchain_huggingface import HuggingFaceEmbeddings


def get_embeddings(model_name: str = "all-MiniLM-L6-v2") -> HuggingFaceEmbeddings:
    """
    SentenceTransformers embeddings via HuggingFace.

    Required model:
    - all-MiniLM-L6-v2
    """
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

