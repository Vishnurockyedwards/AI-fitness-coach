from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv
from langchain_core.documents import Document

from rag.chunking import split_documents
from rag.document_loader import load_documents
from rag.embedding import get_embeddings
from rag.retriever import retrieve_top_k
from rag.vector_store import (
    build_faiss_index,
    index_exists,
    load_faiss_index,
    save_faiss_index,
)


PROMPT_TEMPLATE = """You are an AI fitness coach.

Answer the question using ONLY the provided context.
If the answer is not in the context, say you don't know.

Context:
{retrieved_documents}

Question:
{user_query}

Answer clearly and provide helpful fitness advice."""


@dataclass
class RAGResult:
    answer: str
    retrieved_docs: list[Document]


class RAGPipeline:
    """
    End-to-end RAG:
    - load knowledge base documents
    - chunk
    - embed (SentenceTransformers)
    - store/retrieve via FAISS
    - generate final answer using Gemini with a strict context-only prompt
    """

    def __init__(
        self,
        knowledge_base_dir: str | Path,
        index_dir: str | Path,
        embedding_model_name: str = "all-MiniLM-L6-v2",
        gemini_model_name: str = "gemini-1.5-flash",
    ) -> None:
        self.knowledge_base_dir = Path(knowledge_base_dir)
        self.index_dir = Path(index_dir)
        self.embedding_model_name = embedding_model_name
        self.gemini_model_name = gemini_model_name

        self._load_env()
        self._api_key = self._get_api_key()
        self._configure_gemini()

        self.embeddings = get_embeddings(model_name=self.embedding_model_name)
        self.vector_store = self._load_or_build_vector_store()

    def _load_env(self) -> None:
        # Load .env if present in the repo root, and also support your existing gemini/.env.
        load_dotenv(override=False)
        gemini_env = Path(__file__).resolve().parents[1] / "gemini" / ".env"
        if gemini_env.exists():
            load_dotenv(dotenv_path=gemini_env, override=False)

    def _get_api_key(self) -> str | None:
        # This repo already uses GEMINI_API_KEY; also support GOOGLE_API_KEY.
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def _configure_gemini(self) -> None:
        if not self._api_key:
            return
        genai.configure(api_key=self._api_key)

    def _load_or_build_vector_store(self):
        if index_exists(self.index_dir):
            return load_faiss_index(self.index_dir, self.embeddings)

        kb = load_documents(self.knowledge_base_dir)
        chunks = split_documents(kb.documents, chunk_size=500, chunk_overlap=50)
        store = build_faiss_index(chunks, self.embeddings)
        save_faiss_index(store, self.index_dir)
        return store

    def retrieve(self, user_query: str, k: int = 3) -> list[Document]:
        return retrieve_top_k(self.vector_store, user_query, k=k)

    def generate(self, user_query: str, retrieved_docs: list[Document]) -> str:
        if not self._api_key:
            return (
                "Gemini is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) "
                "in a `.env` file (root) or `gemini/.env`, then restart."
            )

        context = "\n\n---\n\n".join(d.page_content for d in retrieved_docs) if retrieved_docs else ""
        prompt = PROMPT_TEMPLATE.format(
            retrieved_documents=context,
            user_query=(user_query or "").strip(),
        )

        model = genai.GenerativeModel(self.gemini_model_name)
        response = model.generate_content(prompt)
        return (getattr(response, "text", None) or "").strip() or str(response)

    def answer_question(self, user_query: str) -> str:
        """Required convenience function behavior: retrieve -> prompt -> Gemini -> text."""
        docs = self.retrieve(user_query, k=3)
        return self.generate(user_query, docs)

    def answer_question_with_sources(self, user_query: str) -> RAGResult:
        docs = self.retrieve(user_query, k=3)
        answer = self.generate(user_query, docs)
        return RAGResult(answer=answer, retrieved_docs=docs)


_DEFAULT_PIPELINE: RAGPipeline | None = None


def get_default_pipeline() -> RAGPipeline:
    global _DEFAULT_PIPELINE
    if _DEFAULT_PIPELINE is None:
        repo_root = Path(__file__).resolve().parents[1]
        _DEFAULT_PIPELINE = RAGPipeline(
            knowledge_base_dir=repo_root / "knowledge_base",
            index_dir=repo_root / "rag_index",
        )
    return _DEFAULT_PIPELINE


def answer_question(user_query: str) -> str:
    """
    Requirement: simple query function.
    - Retrieve relevant chunks from FAISS
    - Build prompt with context
    - Send prompt to Gemini
    - Return response text
    """
    return get_default_pipeline().answer_question(user_query)

