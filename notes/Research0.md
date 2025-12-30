________________________________________
📄 Report
OCR → LLM Pipeline for Math-Heavy CET PDFs (Feasibility & Design)
________________________________________
1. Problem Statement
The goal is to extract, clean, and structure text from scanned CET preparation PDFs that:
•	Are image-based (scanned pages)
•	Contain dense mathematical and physics notation
•	Include MCQs, equations, symbols, subscripts, superscripts, and diagrams
•	Need to be converted into machine-usable LaTeX for storage in a database (question banks, search, analytics)
Traditional PDF-to-text tools fail due to:
•	No embedded text
•	OCR inaccuracies on math-heavy content
•	Loss of structure and formatting
________________________________________
2. Nature of the Input PDFs (Observed)
From the provided example (MHT-CET Physics PDF):
•	Entire document is scanned
•	Contains:
o	Physics formulas (√, Σ, vectors, θ, μ, subscripts)
o	MCQs with options A–D
o	Step-by-step solutions
o	Diagrams and force/vector sketches
•	Has noise:
o	Watermarks
o	Scan skew
o	Variable font sizes
This places the problem in the category of hard OCR + math normalization, not simple text extraction.
________________________________________
3. Proposed High-Level Pipeline (Validated)
Scanned PDF
 → OCRmyPDF + Tesseract
 → Raw OCR Text (imperfect)
 → Math-aware LLM
 → Cleaned & normalized LaTeX
 → Structured database storage
This is a modern and realistic document-AI approach, used in ed-tech and research systems.
________________________________________
4. OCR Layer Analysis
4.1 OCRmyPDF + Tesseract (Chosen Solution)
Why this combination works best (free & open source):
•	Designed specifically for scanned PDFs
•	Preserves page layout and reading order
•	Adds a searchable text layer instead of flattening content
•	Allows bulk processing
•	Tunable for DPI, deskewing, noise removal
Expected OCR quality:
•	Plain text: ~90%
•	Math symbols: ~60–70%
•	Superscripts/subscripts: inconsistent
•	Diagrams: not interpretable
This output is sufficient for downstream LLM repair, but not for direct database usage.
________________________________________
5. Role of the LLM (Critical Clarification)
The LLM is NOT replacing OCR.
It acts as a post-processing and normalization layer, responsible for:
•	Repairing OCR math errors
•	Converting informal math text into valid LaTeX
•	Normalizing notation across questions
•	Preserving MCQ structure
What LLMs are good at
•	Inferring missing math symbols using context
•	Reconstructing standard physics equations
•	Formatting consistent LaTeX
•	Handling CET/JEE-level physics reliably
What LLMs must NOT do
•	Invent missing equations
•	“Complete” partial statements
•	Interpret diagrams
•	Improve or rewrite question wording
________________________________________
6. What Can Go Wrong (Risks & Mitigation)
6.1 Garbage-In → Confident Garbage-Out
OCR errors may cause LLMs to confidently produce incorrect equations.
Mitigation:
•	Always store raw OCR alongside cleaned LaTeX
•	Force LLM to mark uncertainty (??)
•	Never discard original OCR text
________________________________________
6.2 Diagram Interpretation
LLMs cannot reliably reconstruct vector or force diagrams.
Mitigation:
•	Treat diagrams as image assets
•	Store references instead of attempting LaTeX reconstruction
________________________________________
6.3 Superscripts & Subscripts
This is the most fragile area (e.g., v2 vs v^2).
Mitigation:
•	Let LLM attempt repair
•	Flag ambiguous cases for review
•	Accept that ~15–20% may need manual correction
________________________________________
6.4 Hallucination Risk
LLMs may insert standard formulas not present in OCR.
Mitigation (VERY IMPORTANT):
•	Strict prompting: “Do not add content”
•	One-question-at-a-time processing
•	Structured JSON outputs
•	Temperature = 0
________________________________________
7. Correct Prompting & Architecture (Key Design Choice)
Wrong approach ❌
“Clean this OCR text and give me LaTeX.”
Correct approach ✅
•	Chunk by individual question
•	Provide explicit transformation-only rules
•	Ask for structured output
Example output schema:
{
  "question_latex": "...",
  "options_latex": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "uncertain_tokens": ["theta vs 0"]
}
Both raw OCR and LLM-cleaned LaTeX must be stored.
________________________________________
8. LLM Selection (Open Source & Local)
8.1 Best Open-Source Models (Hugging Face)
🥇 DeepSeek-Math (7B)
•	Strongest math + physics intuition
•	Excellent LaTeX generation
•	Closest open-source equivalent to GPT-4-level math repair
Risk: Overconfidence → must constrain prompts tightly
________________________________________
🥈 Qwen2.5-Math (7B)
•	Excellent instruction-following
•	Cleaner structured outputs (JSON)
•	Slightly weaker physics intuition than DeepSeek
________________________________________
🥉 LLaMA-based Math Models
•	Acceptable but inferior
•	Higher hallucination risk
________________________________________
8.2 Models to Avoid
•	Small general chat models
•	Non-math-tuned LLMs
•	Vision-only OCR models
•	Creative writing–optimized models
________________________________________
9. Running Models Locally (Feasibility)
Yes, local execution is feasible.
Typical PC setup:
•	16 GB RAM
•	CPU or modest GPU
•	7B models using 4-bit quantization
Recommended runtimes:
•	Ollama (simplest, CLI-based)
•	LM Studio (GUI, great for testing)
•	Text Generation WebUI (advanced control)
This allows offline, batch processing of large datasets.
________________________________________
10. Expected Accuracy (Realistic Numbers)
Stage	Approx. Accuracy
OCR text	          ~90%
OCR math	          ~60–70%
LLM math repair	    +15–25%
Final usable LaTeX	~80–85%
This is excellent for exam-prep databases and search systems.
________________________________________
11. Recommended Industry-Style Strategy
1.	OCR all PDFs (OCRmyPDF)
2.	Extract text page-wise
3.	Chunk by question
4.	Normalize via math-aware LLM
5.	Auto-accept high-confidence outputs
6.	Flag 15–20% for manual review
7.	Store both raw and cleaned versions
This balances automation, correctness, and scalability.
________________________________________
12. Final Conclusion
•	The proposed OCR + LLM pipeline is technically sound
•	Fully achievable using free and open-source tools
•	Matches real-world ed-tech document AI practices
•	Requires strict LLM constraints, not blind trust
•	Local execution is practical and scalable
This approach is well-suited for CET / SmartScore-style question banks, analytics, and structured learning systems.________________________________________
