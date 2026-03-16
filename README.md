# Origin — _νοῦς + α_

> AI Agent Orchestration for Institutional Equity Research

**Award: The Biggest Engineering Lift — Most Technically Involved**
[compiled-7 / SanFranSokyo · YC RFS Spring 2026 AI Hackathon](https://luma.com/rhi9rha9?tk=7oFBLC)

### **Watch Our Demo Video**

**[Watch on YouTube](https://youtu.be/pV6Tua9APh8)**

---

## Agent Pipeline

```
Data Ingestion → Japanese NLP → Financial Modeling → Valuation Engine → Report Generation
(EDINET, TDNet,   (Filings,        (3-statement         (DCF, comps,       (Institutional-grade
 IR sites, news)   transcripts,     models, scenario     sum-of-parts)       research output)
                   mgmt commentary) analysis)
```

---

## Tech Stack

| Layer                 | Technology                                                       |
| --------------------- | ---------------------------------------------------------------- |
| Frontend              | Next.js 16, React 19, Tailwind CSS v4                            |
| Backend               | FastAPI, Python 3.12                                             |
| Agent Orchestration   | LangGraph (sequential chaining & agent handoffs)                 |
| Adversarial Framework | AutoGen / AG2 (Bull vs. Bear debate loop)                        |
| Real-time Monitoring  | Redis (100+ concurrent data streams)                             |
| LLM                   | Shisa.ai `shisa-v2.1-llama3.3-70b` (OpenAI-compatible API)       |
| Storage               | SQLite (decision traces), PostgreSQL (metadata), Vector DB (RAG) |

---

## Architecture

Key components:

1. **Swarm Topology** — Specialized vertical agents (IR, Company, News, Satellite) each own their research domain
2. **Central Senior Analyst** — Synthesizes sub-agent reports into an institutional-grade investment memo
3. **Adversarial Debate Loop** — Bull Agent forms thesis → Bear Agent stress-tests with forensic accounting analysis
4. **Decision Traces** — Every claim in the final report is clickable, linking back to the exact source (filing, transcript, audio)
5. **Omni-Channel Ingestion** — Normalizes J-GAAP, IFRS, and US-GAAP data; monitors real-time macro feeds

---

## Running Locally

### Backend

```bash
cd backend
pip install fastapi uvicorn python-dotenv
# Optional: add SHISA_API_KEY to backend/.env for real LLM calls
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### MCP Server (optional)

```bash
cd mcp
pip install -e .
python server.py
```

---

## Contact

[linkedin.com/in/tanphat-ng](https://www.linkedin.com/in/tanphat-ng/)
