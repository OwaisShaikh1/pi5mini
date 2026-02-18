import re
import csv

# ---------- READ INPUT FILE ----------
with open("csv.txt", "r", encoding="utf-8") as f:
    text = f.read()

# ---------- SPLIT SECTIONS ----------
questions_part = text.split("ANSWERS")[0]
answers_part = text.split("ANSWERS")[1].split("SOLUTIONS")[0]
solutions_part = text.split("SOLUTIONS")[1]

# ---------- EXTRACT ANSWERS ----------
answer_dict = {}
answer_matches = re.findall(r'(\d+)\.\s*\(([a-d])\)', answers_part)

for qno, ans in answer_matches:
    answer_dict[qno] = ans

# ---------- EXTRACT SOLUTIONS ----------
solution_dict = {}

# Split solutions by question number
solution_blocks = re.split(r'\n\s*(\d+)\.\s*', solutions_part)

# solution_blocks format: ['', '1', 'solution1', '2', 'solution2', ...]
for i in range(1, len(solution_blocks), 2):
    qno = solution_blocks[i]
    sol = solution_blocks[i + 1].strip()
    solution_dict[qno] = sol

# ---------- EXTRACT QUESTIONS ----------
questions = re.split(r'\n?\s*(\d+)\.\s+', questions_part)

# questions format: ['', '1', 'question1 text...', '2', 'question2 text...', ...]

rows = []

for i in range(1, len(questions), 2):
    qno = questions[i]
    content = questions[i + 1]

    # Extract options
    options = dict(re.findall(r'\(([a-d])\)\s*([^()]+)', content))

    # Remove options from question text
    question_text = re.sub(r'\([a-d]\)\s*[^()]+', '', content).strip()

    rows.append({
        "Question Number": qno,
        "Question": question_text,
        "Option A": options.get("a", "").strip(),
        "Option B": options.get("b", "").strip(),
        "Option C": options.get("c", "").strip(),
        "Option D": options.get("d", "").strip(),
        "Correct Answer": answer_dict.get(qno, ""),
        "Solution": solution_dict.get(qno, "")
    })

# ---------- WRITE CSV ----------
with open("output.csv", "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = [
        "Question Number",
        "Question",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "Correct Answer",
        "Solution"
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("✅ CSV file created successfully as output.csv")
