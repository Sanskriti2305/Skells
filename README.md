# SKELLS — Multilingual Voice RAG

> **HHGOA — Hackathon Project**

SKELLS is a multilingual, voice-enabled Retrieval-Augmented Generation (RAG) system designed to answer questions using grounded information retrieved from a multilingual knowledge base.

The system combines **semantic retrieval, multilingual speech processing, translation, text-to-speech, and grounded answer generation** into a single application.

### 🚀 Live Demo

**[Try SKELLS Live →](https://skells.vercel.app/)**

---

## Overview

SKELLS is built around a simple principle:

> **Retrieve first. Generate second.**

Instead of allowing a language model to answer purely from its internal knowledge, SKELLS retrieves relevant passages from the indexed dataset and uses those passages as the basis for generating answers.

The application also supports voice interaction, allowing users to:

- Speak a question
- Convert speech to text
- Retrieve relevant information
- Generate a grounded answer
- Translate the answer
- Listen to the answer using text-to-speech

---

## ✨ Key Features

### Multilingual RAG

Retrieves relevant passages from a multilingual FAISS-based vector index using multilingual embeddings.

### Voice Interaction

Supports a complete voice pipeline:

```text
Voice Input
     ↓
Speech-to-Text
     ↓
RAG Retrieval
     ↓
Grounded Answer
     ↓
Translation
     ↓
Text-to-Speech
