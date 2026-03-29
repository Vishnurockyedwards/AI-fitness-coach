from __future__ import annotations

from pathlib import Path

import streamlit as st

from rag.rag_pipeline import get_default_pipeline


@st.cache_resource
def _load_pipeline():
    # Builds the FAISS index once if missing, otherwise loads it.
    return get_default_pipeline()


def main() -> None:
    st.set_page_config(page_title="FitAI RAG", page_icon="🏋️", layout="centered")
    st.title("FitAI — RAG Fitness Q&A")
    st.write(
        "Ask a fitness question. The assistant will retrieve relevant context from your local "
        "`knowledge_base/` and answer using Gemini."
    )

    pipeline = _load_pipeline()
    repo_root = Path(__file__).resolve().parent
    st.caption(f"Knowledge base: `{repo_root / 'knowledge_base'}`")
    st.caption(f"FAISS index: `{repo_root / 'rag_index'}` (built once, then reused)")

    user_query = st.text_input(
        "Your question",
        value="What muscles do push-ups train?",
        placeholder="e.g., How should I warm up before leg day?",
    )

    col_a, col_b = st.columns([1, 3])
    with col_a:
        ask = st.button("Answer", type="primary", use_container_width=True)
    with col_b:
        show_sources = st.checkbox("Show retrieved context", value=True)

    if ask:
        if not user_query.strip():
            st.warning("Please enter a question.")
            return

        with st.spinner("Retrieving and generating answer..."):
            result = pipeline.answer_question_with_sources(user_query)

        st.subheader("Answer")
        st.write(result.answer)

        if show_sources:
            st.subheader("Retrieved context (top 3 chunks)")
            if not result.retrieved_docs:
                st.info("No context retrieved.")
            for i, doc in enumerate(result.retrieved_docs, start=1):
                source = doc.metadata.get("source", "unknown")
                with st.expander(f"Chunk {i} — {source}", expanded=(i == 1)):
                    st.write(doc.page_content)


if __name__ == "__main__":
    main()

