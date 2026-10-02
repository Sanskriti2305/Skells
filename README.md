# SKELLS — Multilingual Voice RAG

> **HHGOA 2026 — Task 2**

SKELLS is a multilingual, voice-enabled Retrieval-Augmented Generation (RAG) system designed to answer questions using grounded information retrieved from the multilingual **MSMARCO-XI** dataset.

The system combines **speech-to-text, multilingual retrieval, multiple chunking strategies, vector search, grounded answer generation, translation, and text-to-speech** into a single voice-first application.

### 🚀 Live Demo

**[Try SKELLS Live →](https://skells.vercel.app/)**

---

## Overview

SKELLS is built around a simple principle:

> **Retrieve first. Generate second.**

Instead of allowing a language model to answer purely from its internal knowledge, SKELLS retrieves relevant passages from the indexed knowledge base and uses those passages as the context for answer generation.

The application supports voice interaction from end to end:

```text
Voice Input
     ↓
Speech-to-Text
     ↓
Language Detection
     ↓
Multilingual Retrieval
     ↓
Context Selection
     ↓
Grounded Answer Generation
     ↓
Translation
     ↓
Text-to-Speech
```

---

## ✨ Key Features

### 🌍 Multilingual RAG

SKELLS is designed for multilingual question answering across the languages represented in MSMARCO-XI.

The retrieval pipeline uses multilingual embeddings so that queries and retrieved knowledge can be handled across languages.

### 🎙️ Voice Interaction

Users can interact with SKELLS through voice:

```text
Speak
 ↓
Speech-to-Text
 ↓
Retrieve
 ↓
Generate
 ↓
Translate
 ↓
Listen
```

This makes the system usable without requiring users to type their questions.

### 🧩 Multiple Chunking Strategies

Rather than relying on a single naive chunking method, SKELLS experiments with multiple strategies:

- Passage-based chunking
- Fixed-size chunking
- Semantic chunking
- Metadata-aware chunking
- Parent-child chunking

Each strategy is indexed separately so that retrieval behavior can be compared.

### 🔎 Vector Retrieval

The resulting chunks are embedded using:

```text
intfloat/multilingual-e5-base
```

and indexed using **FAISS** for efficient similarity search.

### 🧠 Grounded Generation

Retrieved passages are provided to the generation model as context.

The goal is to make the generated answer depend on retrieved evidence rather than allowing unsupported free-form generation.

### 🛡️ Guardrails

SKELLS includes checks around the generation pipeline to reduce unsupported responses and handle cases where sufficient retrieved context is unavailable.

The system is designed to recognize when it should not confidently answer rather than blindly generating a response.

### 📊 Retrieval & Latency Analytics

The pipeline is evaluated across multiple queries rather than relying on a single successful example.

Evaluation includes retrieval quality and latency measurements such as:

- P50 latency
- P70 latency
- P100 latency
- Retrieval scores
- Grounding behavior
- Chunking-strategy comparison

---

## 🏗️ System Architecture

```text
                         ┌──────────────────┐
                         │    User Voice    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Speech-to-Text   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Query Processing │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ Multilingual Embeddings   │
                    │ multilingual-e5-base       │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │       FAISS Retrieval      │
                    │                            │
                    │ Passage                    │
                    │ Fixed-size                 │
                    │ Semantic                   │
                    │ Metadata-aware             │
                    │ Parent-child               │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Context + Query  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Answer Generator │
                         │ Qwen             │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Grounding /      │
                         │ Guardrail Checks │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Translation    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Text-to-Speech   │
                         └────────┬─────────┘
                                  │
                                  ▼
                            🔊 User hears
                              answer
```

---

## 📚 Dataset

SKELLS uses the **AI4Bharat MSMARCO-XI** dataset.

The dataset contains multilingual queries, answers, and candidate passages.

Each record provides information including:

```text
query
Answer
query_type
passages
    ├── English_passages
    ├── Translated_passages
    └── is_selected
```

The `is_selected` field provides relevance information that can be used as ground truth when evaluating retrieval quality.

This allows us to evaluate the retriever based on whether it successfully retrieves passages marked as relevant by the dataset.

---

## 🧩 Chunking Pipeline

A major focus of SKELLS is experimenting with different ways of representing knowledge before retrieval.

### 1. Passage Chunking

Uses the provided passage as the basic retrieval unit.

### 2. Fixed-Size Chunking

Splits longer passages into chunks of controlled size.

### 3. Semantic Chunking

Attempts to preserve semantically related content within the same chunk.

### 4. Metadata-Aware Chunking

Enriches chunks with contextual metadata such as language and query information.

Example:

```text
Language: asm_Beng
Query Type: DESCRIPTION
Query ID: ...
Passage: ...
```

### 5. Parent-Child Chunking

Maintains relationships between smaller retrieval units and their larger parent context.

---

## 🔬 Retrieval Evaluation

For every query, SKELLS retrieves candidate passages from the indexed knowledge base.

The dataset's relevance labels allow us to compare:

```text
Dataset Ground Truth
        ↓
Relevant Passage
        ↓
        VS
        ↓
SKELLS Retrieval
        ↓
Retrieved Passages
```

This provides a measurable way to compare different chunking and retrieval strategies.

---

## ⚡ Performance

SKELLS is designed with low-latency retrieval in mind.

We measure latency across multiple queries rather than reporting only the fastest successful request.

Key measurements include:

| Metric | Description |
|---|---|
| P50 | Median pipeline latency |
| P70 | 70th percentile latency |
| P100 | Maximum observed latency |
| Retrieval latency | Time spent retrieving context |
| Generation latency | Time spent generating the answer |

---

## 🧠 Model Stack

| Component | Technology |
|---|---|
| Dataset | AI4Bharat MSMARCO-XI |
| Embeddings | `intfloat/multilingual-e5-base` |
| Vector Search | FAISS |
| Generation | Qwen |
| Speech-to-Text | Sarvam / configured STT provider |
| Translation | Multilingual translation pipeline |
| Text-to-Speech | Configured TTS provider |
| Frontend | React + Vite |
| Backend | API-based RAG pipeline |

---

## 🛡️ RAG Harness

SKELLS is structured as a pipeline rather than a single prompt-to-answer call.

```text
Input
 ↓
Validation
 ↓
Speech Processing
 ↓
Query Embedding
 ↓
Retrieval
 ↓
Context Selection
 ↓
Generation
 ↓
Grounding Check
 ↓
Translation
 ↓
Speech Output
```

The pipeline is designed to handle failures at individual stages and prevent unsupported context from being blindly passed through the system.

---

## 💻 Tech Stack

### AI / ML
- Python
- Sentence Transformers
- Multilingual E5
- Qwen
- FAISS

### Data
- Hugging Face Datasets
- MSMARCO-XI
- Apache Parquet

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI

### Deployment
- Vercel
- Google Colab / GPU-based inference environment

---
## 🚀 Running Locally

### Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd SKELLS
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start the backend

```bash
uvicorn backend.main:app --reload
```

### Start the frontend

```bash
npm install
npm run dev
```

The frontend will then connect to the RAG backend API.

---

## 🎯 Why SKELLS?

Most RAG systems focus primarily on:

```text
Query → Retrieval → Answer
```

SKELLS focuses on the complete interaction:

```text
Voice
 ↓
Language
 ↓
Retrieval
 ↓
Grounded Generation
 ↓
Safety
 ↓
Voice Response
```

The goal is to make multilingual knowledge retrieval feel natural, interactive, and grounded.

---

## ❤️ Built with a lot of debugging

```text
Idea
 ↓
Dataset
 ↓
Errors
 ↓
More errors
 ↓
GPU problems
 ↓
More errors
 ↓
Checkpoint
 ↓
Retrieval
 ↓
Generation
 ↓
Guardrails
 ↓
SKELLS
```

> **We built it. We broke it. We fixed it.**
>
> **SKELLS.**

