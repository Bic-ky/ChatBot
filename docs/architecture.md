# ChatBot Architecture Documentation

## System Architecture

```text
                         ┌─────────────────────┐
                         │ Customer Website    │
                         │ Any Website         │
                         └──────────┬──────────┘
                                    │
                               JS Chat Widget
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ API / Gateway       │
                         │                     │
                         │ CORS                │
                         │ Auth                │
                         │ Rate Limiting       │
                         │ Validation          │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
              ┌──────────────┐             ┌────────────────┐
              │ Chat Service │             │ Knowledge      │
              │              │             │ Service        │
              │ Conversation │             │                │
              │ Context      │             │ Documents      │
              │ Streaming    │             │ Chunking       │
              └──────┬───────┘             │ Embeddings     │
                     │                     │ Retrieval      │
                     ▼                     └───────┬────────┘
              ┌────────────────┐                  │
              │ AI Orchestrator│                  ▼
              │                │          ┌────────────────┐
              │ LangGraph      │          │ PostgreSQL     │
              │ RAG            │          │ + pgvector     │
              │ Web Search     │          └────────────────┘
              │ Tools          │
              │ Guardrails     │
              └───────┬────────┘
                      │
                ┌─────┴──────┐
                ▼            ▼
          ┌──────────┐  ┌─────────────┐
          │ LLM      │  │ Web Search  │
          │ Provider │  │ Provider    │
          └──────────┘  └─────────────┘
```

## Security & Isolation Principle
All requests follow:
`Tenant -> Authentication -> Authorization -> Tenant-scoped Data -> Knowledge Retrieval -> AI Orchestrator -> Controlled Tools -> LLM`
