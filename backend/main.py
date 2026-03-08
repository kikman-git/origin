from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import asyncio
import json
import time
import uuid
from datetime import datetime

app = FastAPI(title="JapanAlpha Mission Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory log store
analysis_logs: dict[str, list[dict]] = {}


def get_mock_events(company: str) -> list[dict]:
    """Generate mock SSE events for Akatsuki (3932.T) style analysis with 4 data-source agents."""
    return [
        # ── Phase 1: Orchestrator receives URL, identifies company ──
        {"agent": "orchestrator", "status": "running", "message": f"Received: {company} — Resolving corporate identity...", "phase": "init", "delay": 0.3,
         "tool": {"name": "google_search", "input": {"query": f"{company} IR investor relations"}, "status": "calling"}},

        {"agent": "orchestrator", "status": "running", "message": "Identified: Akatsuki Inc. (3932.T) — aktsk.jp/ir/", "phase": "init", "delay": 0.7,
         "tool": {"name": "google_search", "status": "completed",
                  "output": {"company": "Akatsuki Inc.", "ticker": "3932.T", "ir_url": "https://aktsk.jp/ir/", "sector": "Entertainment/Gaming", "hq": "Meguro, Tokyo"},
                  "evidence_id": "ev-orch-1"}},

        {"agent": "orchestrator", "status": "running", "message": "Dispatching company URL to 4 agents in parallel...", "phase": "dispatch", "delay": 0.4},

        # ── Phase 2: Each agent receives the URL and searches independently ──

        # Agent 1 — IR / Filings: crawls IR page → finds EDINET/TDnet links
        {"agent": "ir", "status": "running", "message": "Crawling https://aktsk.jp/ir/ for filing links...",
         "phase": "search", "delay": 0.3,
         "tool": {"name": "web_crawl", "input": {"url": "https://aktsk.jp/ir/", "extract": ["pdf_links", "edinet_links", "tdnet_links"]}, "status": "calling"}},

        # Agent 2 — Audio: crawls IR page → finds YouTube earnings call link
        {"agent": "company", "status": "running", "message": "Crawling https://aktsk.jp/ir/ for video/audio links...",
         "phase": "search", "delay": 0.2,
         "tool": {"name": "web_crawl", "input": {"url": "https://aktsk.jp/ir/", "extract": ["youtube_links", "audio_links", "webinar_links"]}, "status": "calling"}},

        # Agent 3 — Macro: Google searches for sector-relevant policy
        {"agent": "news", "status": "running", "message": "Searching government policy for Entertainment/Gaming sector...",
         "phase": "search", "delay": 0.4,
         "tool": {"name": "google_search", "input": {"queries": ["BOJ monetary policy 2026", "METI content industry policy", "Digital Agency AI promotion", "JFTC mobile platform regulation"], "sector": "Entertainment/Gaming"}, "status": "calling"}},

        # Agent 4 — Geospatial: resolves HQ address → tasks satellite
        {"agent": "satellite", "status": "running", "message": "Resolving HQ address from https://aktsk.jp and tasking satellite...",
         "phase": "search", "delay": 0.3,
         "tool": {"name": "geocode_and_task", "input": {"company_url": "https://aktsk.jp", "resolve": "headquarters coordinates", "resolution": "0.5m"}, "status": "calling"}},

        # ── Phase 3: Crawl results + data retrieval ──

        {"agent": "ir", "status": "running", "message": "Found 15 IR documents on aktsk.jp/ir/. Fetching EDINET filings...",
         "phase": "analyze", "delay": 0.7,
         "tool": {"name": "web_crawl", "status": "completed",
                  "output": {"pdfs_found": 15, "quarterly_reports": 4, "supplementary_data": 4, "qa_summary": 1, "latest": "Q3 FY2026 (2026/02/09)"},
                  "evidence_id": "ev-ir-0"}},

        {"agent": "ir", "status": "running", "message": "Downloaded 5 EDINET filings + 4 TDnet disclosures",
         "phase": "analyze", "delay": 0.6,
         "tool": {"name": "edinet_api", "input": {"edinet_code": "E33829", "period": "FY2026"},
                  "status": "completed",
                  "output": {"edinet_docs": 5, "tdnet_docs": 4, "quarterly_q2": "E33829-S100XXXX", "segment_change": "3 new segments announced", "dividend_notice": "DOE 4%, JPY 55/share interim"},
                  "evidence_id": "ev-ir-1"}},

        {"agent": "company", "status": "running", "message": "Found YouTube link: Q2 FY2026 Earnings Presentation. Downloading...",
         "phase": "analyze", "delay": 0.5,
         "tool": {"name": "web_crawl", "status": "completed",
                  "output": {"youtube_url": "https://www.youtube.com/watch?v=eaeBSWsd8mU", "label": "Q2 FY2026 Earnings Presentation (video)",
                             "qa_pdf_url": "https://aktsk.jp/ir/library/pdf/qa_summary_q2_fy2026.pdf",
                             "qa_pdf_title": "2026年3月期 第2四半期 Q&Aサマリー",
                             "qa_pdf_preview": "Q1: 怪獣8号ゲームの今後の海外展開計画について教えてください。\nA1: 現在、北米・欧州・アジア太平洋地域で展開中です。FY2026通期で累計売上高50億円を目標としております。特にアニメ第2期との連動施策を計画しております。\n\nQ2: AI-DXソリューション事業の収益見通しは？\nA2: FY2026通期で売上高10億円を見込んでおります。主力はエンタメ企業向けAI開発支援と、自社IP活用のAIサービスです。\n\nQ3: パパブブレ買収のシナジーについて\nA3: IP×リアル体験の創出を進めています。怪獣8号コラボキャンディが好評で、ポップアップストアでの販売が想定を上回っております。\n\nQ4: 株主還元方針について\nA4: DOE4%を基準とし、中間配当55円を実施いたしました。通期では110円を見込んでおります。",
                             "qa_pdf_preview_en": "Q1: Please tell us about future overseas expansion plans for the Kaiju No.8 game.\nA1: We are currently expanding in North America, Europe, and Asia-Pacific. Our target is cumulative revenue of JPY 5B for full-year FY2026. We are planning promotional campaigns tied to the anime Season 2.\n\nQ2: What is the revenue outlook for the AI-DX Solutions business?\nA2: We project revenue of JPY 1B for full-year FY2026. Our core offerings are AI development support for entertainment companies and AI services leveraging our own IP.\n\nQ3: What synergies do you expect from the Papabubble acquisition?\nA3: We are creating IP x real-world experiences. The Kaiju No.8 collaboration candy has been well-received, with pop-up store sales exceeding our expectations.\n\nQ4: What is your shareholder return policy?\nA4: Using DOE 4% as our benchmark, we paid an interim dividend of JPY 55/share. We project JPY 110/share for the full year."},
                  "evidence_id": "ev-co-0"}},

        {"agent": "company", "status": "running", "message": "Video downloaded (28:14). Running Whisper transcription...",
         "phase": "analyze", "delay": 0.8,
         "tool": {"name": "youtube_dl", "status": "completed",
                  "output": {"video_id": "eaeBSWsd8mU", "duration": "28:14", "language": "Japanese", "speaker": "取締役副社長 石倉一紘", "format": "Q2 FY2026 Earnings",
                             "title": "2026年3月期 第2四半期 決算説明会 | Akatsuki Inc."},
                  "evidence_id": "ev-co-1"}},

        {"agent": "news", "status": "running", "message": "87 policy pages retrieved. Filtering for Entertainment/Gaming relevance...",
         "phase": "analyze", "delay": 0.7,
         "tool": {"name": "google_search", "status": "completed",
                  "output": {"total_results": 87, "sector_relevant": 14, "top_sources": ["BOJ", "METI", "Digital Agency", "JFTC"], "key_policies": 4},
                  "evidence_id": "ev-nw-1"}},

        {"agent": "satellite", "status": "running", "message": "HQ resolved: 35.6340N, 139.7082E (Meguro). Imagery acquired.",
         "phase": "analyze", "delay": 0.9,
         "tool": {"name": "geocode_and_task", "status": "completed",
                  "output": {"coordinates": "35.6340N, 139.7082E", "facility": "Akatsuki HQ Meguro", "image_date": "2026-03-05", "cloud_cover": "5%", "ground_resolution": "0.5m"},
                  "evidence_id": "ev-sat-1"}},

        # ── Phase 4: Deep analysis with LLM + specialized tools ──

        {"agent": "ir", "status": "running", "message": "Q2 Results: Revenue JPY 7.6B / Operating Profit JPY 3.4B / Net Income JPY 3.0B",
         "phase": "insight", "delay": 0.8,
         "tool": {"name": "filing_parser", "input": {"doc_id": "E33829-S100XXXX", "extract": ["revenue", "operating_income", "net_income", "segment_breakdown"]},
                  "status": "completed",
                  "output": {"revenue": "¥7,602M", "operating_income": "¥3,422M", "net_income": "¥3,007M", "operating_margin": "45.0%",
                             "game_comic_revenue": "¥5,200M", "entame_lifestyle": "¥1,800M", "ai_dx_solutions": "¥602M",
                             "investment_exits": "¥1,800M (H1 cumulative)", "dividend": "¥55/share (interim)", "doe": "4.0%",
                             "yoy_revenue_growth": "+12.3%", "yoy_op_growth": "+28.7%",
                             "doc_title": "第2四半期報告書 (Q2 FY2026)", "filing_date": "2026-02-09"},
                  "evidence_id": "ev-ir-2"}},

        {"agent": "ir", "status": "running", "message": "New segment structure: Game/Comic, Entertainment/Lifestyle, AI-DX Solutions",
         "phase": "insight", "delay": 0.6,
         "tool": {"name": "llm_extract", "input": {"task": "segment_restructure_analysis", "source": "Q2 FY2026 Quarterly Report"},
                  "status": "completed",
                  "output": {"new_segments": ["Game/Comic", "Entertainment/Lifestyle", "AI-DX Solutions"], "m_and_a": "2 acquisitions (Papabubble, 1 other)", "vision_change": "Mission/Vision updated for next growth stage", "ipo_exits": "19 cumulative exits, 4 IPOs in 2 years"},
                  "evidence_id": "ev-ir-3"}},

        {"agent": "company", "status": "running", "message": "Transcription complete (42,850 tokens). Analyzing management tone...",
         "phase": "insight", "delay": 1.2,
         "tool": {"name": "whisper_transcribe", "input": {"video_id": "eaeBSWsd8mU", "language": "ja", "diarization": True},
                  "status": "completed",
                  "output": {"duration_min": 28, "speakers_identified": 1, "speaker": "取締役副社長 石倉一紘", "transcript_tokens": 42850,
                             "key_topics": ["segment change", "M&A strategy", "Kaiju No.8 game launch"],
                             "transcript_preview": "皆様、本日はお忙しい中、2026年3月期第2四半期の決算説明会にご参加いただき誠にありがとうございます。取締役副社長の石倉でございます。\n\nまず業績のハイライトからご説明いたします。売上高は76億2百万円、営業利益は34億22百万円となりました。\n\n特に注目すべきは、怪獣8号ゲームの好調な立ち上がりです。リリース初月で売上高20億円を突破し、海外比率は40%に達しております。これはアニメ連動型のライブオペレーション戦略が奏功した結果です。\n\nまた、事業セグメントの再編について発表いたします。従来のゲーム事業を中心とした体制から、Game/Comic事業、エンターテインメント・ライフスタイル事業、AI-DXソリューション事業の3セグメント体制へ移行いたします。\n\nM&A戦略については、パパブブレを含む2件の買収を完了し、IP×リアル領域でのシナジー創出を進めております。",
                             "transcript_preview_en": "Thank you all for joining today's Q2 FY2026 earnings presentation despite your busy schedules. I am Ishikura, Executive Vice President.\n\nLet me begin with the performance highlights. Revenue was JPY 7,602M and operating income was JPY 3,422M.\n\nOf particular note is the strong launch of the Kaiju No.8 game. It surpassed JPY 2B in revenue in its first month, with overseas accounting for 40%. This is the result of our anime-linked live operations strategy.\n\nWe are also announcing a restructuring of our business segments. We will transition from a game-centric structure to a 3-segment structure: Game/Comic, Entertainment/Lifestyle, and AI-DX Solutions.\n\nRegarding our M&A strategy, we have completed 2 acquisitions including Papabubble and are pursuing synergy creation in the IP x real-world domain."},
                  "evidence_id": "ev-co-2"}},

        {"agent": "company", "status": "running", "message": "Management tone: Confident. Key: 'Revenue and profit growth expected for FY2026'",
         "phase": "insight", "delay": 0.8,
         "tool": {"name": "llm_sentiment", "input": {"task": "management_tone_analysis", "transcript_id": "eaeBSWsd8mU", "focus": ["forward_guidance", "m_and_a_conviction", "risk_awareness"]},
                  "status": "completed",
                  "output": {"overall_tone": "Confident", "confidence_score": 0.81, "guidance": "Revenue and profit growth YoY expected", "kaiju8_launch": "JPY 2B+ revenue in first month, 40% overseas", "m_and_a_stance": "Active — pursuing real+digital IP synergies", "shareholder_return": "DOE raised to 4%, stronger returns planned"},
                  "evidence_id": "ev-co-3"}},

        {"agent": "news", "status": "running", "message": "METI content export target JPY 500B — direct tailwind for IP businesses",
         "phase": "insight", "delay": 0.7,
         "tool": {"name": "llm_policy_impact", "input": {"task": "sector_impact_analysis", "policies": ["METI content export", "Digital Agency AI promotion", "JFTC mobile platform rules"], "target_sector": "Entertainment/Gaming"},
                  "status": "completed",
                  "output": {"meti_content_impact": "Positive (JPY 500B export target benefits IP holders)", "digital_agency_ai": "Positive (AI-DX segment directly aligned)", "jftc_mobile": "Positive (fairer mobile platform fees)", "net_policy_score": "+0.65"},
                  "evidence_id": "ev-nw-2"}},

        {"agent": "news", "status": "running", "message": "BOJ rate hold at 0.5% — Low cost of capital supports M&A strategy",
         "phase": "insight", "delay": 0.5,
         "tool": {"name": "macro_cross_ref", "input": {"policy": "BOJ rate decision March 2026", "company_impact": "M&A financing and VC exit environment"},
                  "status": "completed",
                  "output": {"boj_rate": "0.5% (hold)", "m_and_a_impact": "Favorable — low borrowing costs support acquisition strategy", "vc_exit_env": "Active — IPO market healthy, 4 portfolio IPOs in 2 years", "yen_impact": "Neutral for domestic entertainment"},
                  "evidence_id": "ev-nw-3"}},

        {"agent": "satellite", "status": "running", "message": "Office occupancy analysis: High activity detected at HQ and subsidiary offices",
         "phase": "insight", "delay": 1.0,
         "tool": {"name": "cv_analyzer", "input": {"task": "office_activity_estimation", "image_id": "sat-2026-03-05-akatsuki", "coordinates": "35.6340N, 139.7082E", "models": ["building_occupancy", "parking_density", "foot_traffic"]},
                  "status": "completed",
                  "output": {"coordinates": "35.6340N, 139.7082E", "hq_occupancy": "High", "parking_utilization": "82%", "nearby_foot_traffic": "+18% vs 6 months ago", "expansion_indicator": "New signage detected on adjacent building"},
                  "evidence_id": "ev-sat-2"}},

        {"agent": "satellite", "status": "running", "message": "Event venue analysis: Kaiju No.8 pop-up store traffic — high consumer engagement",
         "phase": "insight", "delay": 0.7,
         "tool": {"name": "poi_analysis", "input": {"target": "Kaiju No.8 promotional events Tokyo", "coordinates": "35.6595N, 139.7005E"},
                  "status": "completed",
                  "output": {"event_detected": True, "venue_foot_traffic": "High (est. 3,200 visitors/day)", "social_media_mentions": "+340% vs baseline", "nearby_retail_spillover": "+12% foot traffic"},
                  "evidence_id": "ev-sat-3"}},

        # ── Phase 5: Agents complete ──
        {"agent": "ir", "status": "completed", "message": "Filing analysis complete: Solid Q2 with new growth segments and active M&A pipeline",
         "phase": "done", "delay": 0.4},
        {"agent": "company", "status": "completed", "message": "Transcript analysis complete: Management confident, growth guidance maintained",
         "phase": "done", "delay": 0.3},
        {"agent": "news", "status": "completed", "message": "Policy analysis complete: Favorable environment for content IP and AI-DX",
         "phase": "done", "delay": 0.3},
        {"agent": "satellite", "status": "completed", "message": "Geospatial analysis complete: Strong physical signals — office expansion and event traffic",
         "phase": "done", "delay": 0.4},

        # ── Phase 6: Orchestrator synthesizes and hands off to debate ──
        {"agent": "orchestrator", "status": "running", "message": "Aggregating results from all agents...", "phase": "synthesize", "delay": 1.0},
        {"agent": "orchestrator", "status": "running", "message": "Cross-referencing evidence across 4 data sources...", "phase": "synthesize", "delay": 1.0},
        {"agent": "orchestrator", "status": "completed", "message": "Evidence package compiled. Initiating adversarial debate...", "phase": "synthesize", "delay": 0.5},

        # ══════════════════════════════════════════════════════════════
        # ── Phase 7: ADVERSARIAL DEBATE — 10 Rounds, Bull vs Bear ──
        # ══════════════════════════════════════════════════════════════

        # ── Round 1: IP Monetization ──
        {"agent": "bull", "status": "running", "message": "Kaiju No.8 proves the IP monetization engine works — JPY 2B+ in month one, 40% overseas", "phase": "debate", "debate_round": 1, "delay": 0.7,
         "argument": {"position": "bull", "round": 1, "text": "Kaiju No.8: JPY 2B+ revenue in month one, 40% from overseas markets. This IP monetization engine is PROVEN at global scale.", "evidence_ids": ["ev-co-3", "ev-ir-2"], "strength": 0.85}},

        {"agent": "bear", "status": "running", "message": "One hit game does not make a sustainable business", "phase": "debate", "debate_round": 1, "delay": 0.7,
         "argument": {"position": "bear", "round": 1, "text": "One hit title? Classic single-game dependency. Legacy titles declining YoY. Dragon Ball Z Dokkan Battle is aging. This is a one-trick pony.", "evidence_ids": ["ev-ir-2", "ev-ir-3"], "strength": 0.72}},

        # ── Round 2: Diversification ──
        {"agent": "bull", "status": "running", "message": "3-segment restructuring directly addresses concentration risk", "phase": "debate", "debate_round": 2, "delay": 0.7,
         "argument": {"position": "bull", "round": 2, "text": "The 3-segment pivot is the ANSWER to concentration risk. Game/Comic + Ent/Lifestyle + AI-DX = strategic diversification.", "evidence_ids": ["ev-ir-3", "ev-co-2"], "strength": 0.78}},

        {"agent": "bear", "status": "running", "message": "Three simultaneous strategic shifts = execution risk", "phase": "debate", "debate_round": 2, "delay": 0.7,
         "argument": {"position": "bear", "round": 2, "text": "Three simultaneous pivots? AI-DX unproven. Papabubble = CANDY. Two M&A integrations in H2. Management is spreading dangerously thin.", "evidence_ids": ["ev-ir-3", "ev-co-3"], "strength": 0.80}},

        # ── Round 3: Alternative Data ──
        {"agent": "bull", "status": "running", "message": "Satellite data independently confirms physical expansion — you can't fake this", "phase": "debate", "debate_round": 3, "delay": 0.7,
         "argument": {"position": "bull", "round": 3, "text": "Satellite imagery confirms HQ expansion + new signage on adjacent building. 3,200 visitors/day at Kaiju No.8 pop-ups. This is UNFAKEABLE alternative data.", "evidence_ids": ["ev-sat-2", "ev-sat-3"], "strength": 0.88}},

        {"agent": "bear", "status": "running", "message": "Foot traffic doesn't prove unit economics", "phase": "debate", "debate_round": 3, "delay": 0.7,
         "argument": {"position": "bear", "round": 3, "text": "Foot traffic at pop-ups doesn't prove unit economics. Pop-up stores are marketing spend, not revenue drivers. Show me the margin data.", "evidence_ids": ["ev-sat-3"], "strength": 0.65}},

        # ── Round 4: Valuation ──
        {"agent": "bull", "status": "running", "message": "P/E still below entertainment sector average", "phase": "debate", "debate_round": 4, "delay": 0.7,
         "argument": {"position": "bull", "round": 4, "text": "At JPY 2,420, P/E is still 15x — below the entertainment sector average of 22x. There's significant room for multiple expansion.", "evidence_ids": ["ev-ir-2"], "strength": 0.75}},

        {"agent": "bear", "status": "running", "message": "Market already priced in Kaiju No.8 success", "phase": "debate", "debate_round": 4, "delay": 0.7,
         "argument": {"position": "bear", "round": 4, "text": "Stock up 36% in 6 months. Market ALREADY priced in Kaiju No.8. If the game decays at typical mobile rates (30% M/M), the narrative collapses entirely.", "evidence_ids": ["ev-co-3", "ev-ir-2"], "strength": 0.82}},

        # ── Round 5: Capital Allocation ──
        {"agent": "bull", "status": "running", "message": "19 VC exits with 4 IPOs in 2 years — best-in-class capital allocation", "phase": "debate", "debate_round": 5, "delay": 0.7,
         "argument": {"position": "bull", "round": 5, "text": "19 cumulative VC exits including 4 IPOs in just 2 years. This is best-in-class capital allocation. The VC portfolio ALONE justifies a premium.", "evidence_ids": ["ev-ir-2", "ev-nw-3"], "strength": 0.83}},

        {"agent": "bear", "status": "running", "message": "VC exits are one-time gains, not recurring revenue", "phase": "debate", "debate_round": 5, "delay": 0.7,
         "argument": {"position": "bear", "round": 5, "text": "VC exits are one-time gains — JPY 1.8B in H1 is non-recurring. Strip out investment exits and core operating margins tell a different story.", "evidence_ids": ["ev-ir-2", "ev-ir-1"], "strength": 0.70}},

        # ── Round 6: M&A Integration ──
        {"agent": "bull", "status": "running", "message": "Papabubble IP x retail synergy is already producing results", "phase": "debate", "debate_round": 6, "delay": 0.7,
         "argument": {"position": "bull", "round": 6, "text": "Papabubble synergy is WORKING. Kaiju No.8 collab candy sold out in 3 days. IP x retail is a new revenue vector that competitors can't replicate.", "evidence_ids": ["ev-co-3", "ev-sat-3"], "strength": 0.72}},

        {"agent": "bear", "status": "running", "message": "Candy is not a tech moat — this is a gaming company buying a candy shop", "phase": "debate", "debate_round": 6, "delay": 0.7,
         "argument": {"position": "bear", "round": 6, "text": "A gaming company buying a CANDY SHOP. This is strategy drift, pure and simple. Dual M&A integration will drain management focus from core gaming.", "evidence_ids": ["ev-ir-3", "ev-co-3"], "strength": 0.78}},

        # ── Round 7: Policy Tailwind ──
        {"agent": "bull", "status": "running", "message": "METI JPY 500B content export target = direct government tailwind", "phase": "debate", "debate_round": 7, "delay": 0.7,
         "argument": {"position": "bull", "round": 7, "text": "METI's JPY 500B content export policy + Digital Agency AI promotion = dual government tailwind. Akatsuki is positioned at the intersection of BOTH policies.", "evidence_ids": ["ev-nw-2", "ev-nw-1"], "strength": 0.86}},

        {"agent": "bear", "status": "running", "message": "Government policy targets the industry, not specific companies", "phase": "debate", "debate_round": 7, "delay": 0.7,
         "argument": {"position": "bear", "round": 7, "text": "METI targets the industry broadly — every competitor benefits equally. Government policy is not a company-specific moat. Bandai Namco benefits MORE.", "evidence_ids": ["ev-nw-2"], "strength": 0.62}},

        # ── Round 8: Macro Risk ──
        {"agent": "bull", "status": "running", "message": "BOJ hold at 0.5% supports M&A strategy with low cost of capital", "phase": "debate", "debate_round": 8, "delay": 0.7,
         "argument": {"position": "bull", "round": 8, "text": "BOJ holding at 0.5% keeps cost of capital low. Perfect environment for the M&A-driven growth strategy. IPO market is healthy for VC exits.", "evidence_ids": ["ev-nw-3"], "strength": 0.80}},

        {"agent": "bear", "status": "running", "message": "Rate hike risk could compress growth multiples", "phase": "debate", "debate_round": 8, "delay": 0.7,
         "argument": {"position": "bear", "round": 8, "text": "BOJ has signaled potential rate hikes in H2 2026. A move to 0.75% would compress growth multiples across the entertainment sector. M&A financing costs rise.", "evidence_ids": ["ev-nw-3", "ev-nw-1"], "strength": 0.75}},

        # ── Round 9: Management Quality ──
        {"agent": "bull", "status": "running", "message": "CFO Ishikura's tone analysis shows high confidence with data-backed guidance", "phase": "debate", "debate_round": 9, "delay": 0.7,
         "argument": {"position": "bull", "round": 9, "text": "AI sentiment analysis of CFO Ishikura: 81% confidence score. Revenue AND profit growth guidance maintained. This isn't hype — it's data-backed conviction.", "evidence_ids": ["ev-co-3", "ev-co-2"], "strength": 0.90}},

        {"agent": "bear", "status": "running", "message": "Management optimism is not the same as execution certainty", "phase": "debate", "debate_round": 9, "delay": 0.7,
         "argument": {"position": "bear", "round": 9, "text": "Management ALWAYS sounds confident in earnings calls. Sentiment analysis can't predict execution. Show me 2 consecutive quarters of segment growth first.", "evidence_ids": ["ev-co-2", "ev-co-3"], "strength": 0.58}},

        # ── Round 10: Final — Evidence Convergence ──
        {"agent": "bull", "status": "running", "message": "FINAL: 4 independent data sources ALL converge on the growth thesis", "phase": "debate", "debate_round": 10, "delay": 0.7,
         "argument": {"position": "bull", "round": 10, "text": "4 independent data sources converge: EDINET filings confirm 45% margins. Whisper transcript confirms guidance. METI policy confirms tailwind. Satellite confirms physical expansion. This level of convergence is RARE.", "evidence_ids": ["ev-ir-2", "ev-co-3", "ev-nw-2", "ev-sat-2"], "strength": 0.92}},

        {"agent": "bear", "status": "running", "message": "Correlation across sources does not eliminate systematic risk", "phase": "debate", "debate_round": 10, "delay": 0.7,
         "argument": {"position": "bear", "round": 10, "text": "Source convergence doesn't eliminate systematic risk. A single macro shock — yen spike, China gaming ban, or App Store fee hike — undermines ALL sources simultaneously. Correlation is not causation.", "evidence_ids": ["ev-nw-3", "ev-nw-1", "ev-ir-2"], "strength": 0.55}},

        # ── Phase 8: Automated Verdict (no judge, system-generated) ──
        {"agent": "orchestrator", "status": "completed", "message": "VERDICT: BUY — Bull prevails 7-3 across 10 rounds with convergent multi-source evidence", "phase": "verdict", "debate_round": 10, "delay": 1.0,
         "argument": {"position": "bull", "round": 10, "ruling": "verdict"},
         "judgment": {
             "signal": "BUY",
             "confidence": 74,
             "thesis": [
                 {"claim": "Kaiju No.8 validates IP monetization at scale (JPY 2B+, 40% overseas) — proven global revenue engine",
                  "evidence_ids": ["ev-co-3", "ev-ir-2"]},
                 {"claim": "3-segment restructuring provides strategic diversification into Game/Comic, Ent/Lifestyle, and AI-DX",
                  "evidence_ids": ["ev-ir-3", "ev-co-2"]},
                 {"claim": "Satellite data independently confirms physical expansion — unfakeable alternative data signal",
                  "evidence_ids": ["ev-sat-2", "ev-sat-3"]},
                 {"claim": "19 VC exits (4 IPOs in 2 years) demonstrate best-in-class capital allocation",
                  "evidence_ids": ["ev-ir-2", "ev-nw-3"]},
                 {"claim": "Dual government tailwind: METI JPY 500B content export + Digital Agency AI promotion",
                  "evidence_ids": ["ev-nw-2", "ev-nw-1"]},
             ],
             "risks": [
                 {"claim": "Single-title concentration: Kaiju No.8 mobile decay rate is the key monitoring metric",
                  "evidence_ids": ["ev-ir-2", "ev-co-3"]},
                 {"claim": "Dual M&A integration (Papabubble + 1 other) creates execution risk and management bandwidth concern",
                  "evidence_ids": ["ev-ir-3", "ev-co-3"]},
                 {"claim": "BOJ rate hike risk in H2 2026 could compress growth multiples and increase M&A financing costs",
                  "evidence_ids": ["ev-nw-3"]},
                 {"claim": "Valuation already reflects 36% rally — limited margin of safety at current levels",
                  "evidence_ids": ["ev-co-3", "ev-ir-2"]},
             ],
             "summary": "After 10 rounds of adversarial debate, Bull prevails 7-3 with a BUY signal at 74% confidence. The convergent evidence across 4 independent data sources — EDINET filings, Whisper-transcribed earnings calls, government policy analysis, and satellite imagery — provides conviction that single-source analysis cannot achieve. Bear mounted strong challenges on valuation (Round 4), M&A integration risk (Round 6), and execution uncertainty (Round 2), but could not counter the satellite-confirmed physical expansion signals or the multi-source evidence convergence in the final rounds.",
             "debate_summary": {
                 "rounds": 10,
                 "bull_score": "7/10 rounds won — dominant in alternative data, policy, and evidence convergence",
                 "bear_score": "3/10 rounds won — strongest on valuation, M&A risk, and execution concerns",
                 "verdict_basis": "Multi-source evidence convergence across 4 independent data sources",
             },
             "alpha": {
                 "expected_return": 82,
                 "probability": 68,
                 "drivers": [
                     {"factor": "Kaiju No.8 global IP monetization (JPY 2B+ month 1, 40% overseas)", "impact": 35, "evidence_ids": ["ev-co-3", "ev-ir-2"]},
                     {"factor": "3-segment diversification: Game/Comic + Ent/Lifestyle + AI-DX", "impact": 20, "evidence_ids": ["ev-ir-3"]},
                     {"factor": "19 VC exits (4 IPOs) — proven capital allocation", "impact": 15, "evidence_ids": ["ev-ir-2", "ev-nw-3"]},
                     {"factor": "METI JPY 500B content export policy tailwind", "impact": 12, "evidence_ids": ["ev-nw-2", "ev-nw-1"]},
                 ],
             },
             "beta": {
                 "risk_score": 0.38,
                 "probability": 32,
                 "factors": [
                     {"factor": "Single-title concentration: Kaiju No.8 revenue decay risk", "severity": 0.75, "evidence_ids": ["ev-ir-2", "ev-co-3"]},
                     {"factor": "Dual M&A integration in H2 — management bandwidth", "severity": 0.60, "evidence_ids": ["ev-ir-3", "ev-co-3"]},
                     {"factor": "BOJ rate hike risk — may compress growth multiples", "severity": 0.45, "evidence_ids": ["ev-nw-3"]},
                     {"factor": "Valuation already reflects 36% rally, limited margin of safety", "severity": 0.50, "evidence_ids": ["ev-co-3", "ev-ir-2"]},
                 ],
             },
         }},
    ]


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# Try to import LangGraph — fall back to mock if unavailable
try:
    from graph import app as langgraph_app
    from langchain_core.messages import HumanMessage
    USE_LANGGRAPH = True
except ImportError:
    USE_LANGGRAPH = False


@app.get("/api/analyze/{company}")
async def analyze_company(company: str):
    """SSE endpoint that streams agent analysis events. Uses LangGraph if available, otherwise mock data."""
    run_id = str(uuid.uuid4())[:8]
    analysis_logs[run_id] = []

    async def mock_stream():
        start_time = time.time()
        meta = {"type": "meta", "run_id": run_id, "company": company, "timestamp": datetime.now().isoformat()}
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

        for event in get_mock_events(company):
            delay = event.pop("delay", 0.3)
            await asyncio.sleep(delay)
            elapsed = round(time.time() - start_time, 2)
            log_entry = {"type": "agent_event", "run_id": run_id, "timestamp": datetime.now().isoformat(), "elapsed": elapsed, **event}
            analysis_logs[run_id].append(log_entry)
            yield f"data: {json.dumps(log_entry, ensure_ascii=False)}\n\n"

        done = {"type": "done", "run_id": run_id, "elapsed": round(time.time() - start_time, 2)}
        yield f"data: {json.dumps(done, ensure_ascii=False)}\n\n"

    async def langgraph_stream():
        start_time = time.time()
        meta = {"type": "meta", "run_id": run_id, "company": company, "timestamp": datetime.now().isoformat()}
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

        init_msg = {"type": "agent_event", "run_id": run_id, "timestamp": datetime.now().isoformat(), "elapsed": 0.0, "agent": "orchestrator", "status": "running", "message": f"Starting live LangGraph analysis of {company}", "phase": "init"}
        analysis_logs[run_id].append(init_msg)
        yield f"data: {json.dumps(init_msg, ensure_ascii=False)}\n\n"

        try:
            async for output in langgraph_app.astream({"company": company, "ticker": company, "raw_data": {}, "messages": []}):
                for node_name, state_updates in output.items():
                    if "messages" in state_updates:
                        for msg in state_updates["messages"]:
                            elapsed = round(time.time() - start_time, 2)
                            log_entry = {"type": "agent_event", "run_id": run_id, "timestamp": datetime.now().isoformat(), "elapsed": elapsed, **msg}
                            analysis_logs[run_id].append(log_entry)
                            yield f"data: {json.dumps(log_entry, ensure_ascii=False)}\n\n"
                            await asyncio.sleep(0.1)
        except Exception as e:
            err_msg = {"type": "agent_event", "run_id": run_id, "timestamp": datetime.now().isoformat(), "elapsed": round(time.time() - start_time, 2), "agent": "orchestrator", "status": "error", "message": f"Graph Execution Error: {str(e)}", "phase": "judgment"}
            yield f"data: {json.dumps(err_msg, ensure_ascii=False)}\n\n"

        done = {"type": "done", "run_id": run_id, "elapsed": round(time.time() - start_time, 2)}
        yield f"data: {json.dumps(done, ensure_ascii=False)}\n\n"

    stream = langgraph_stream() if USE_LANGGRAPH else mock_stream()
    return StreamingResponse(stream, media_type="text/event-stream")


@app.get("/api/logs/{run_id}")
async def get_logs(run_id: str):
    """Retrieve stored logs for a specific analysis run."""
    if run_id not in analysis_logs:
        return {"error": "Run not found"}
    return {"run_id": run_id, "logs": analysis_logs[run_id]}


@app.get("/api/logs")
async def list_logs():
    """List all analysis runs."""
    return {"runs": [{"run_id": k, "event_count": len(v)} for k, v in analysis_logs.items()]}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
