import sys
import os
import re

# ======================================================
# DJANGO BOOTSTRAP (STANDALONE SCRIPT)
# ======================================================

# Absolute path to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# This must point to the folder that contains manage.py
PROJECT_ROOT = BASE_DIR
sys.path.insert(0, PROJECT_ROOT)

# Set Django settings (INNER project)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartscore.settings")

import django
django.setup()

# ======================================================
# IMPORTS AFTER DJANGO SETUP
# ======================================================

from django.utils import timezone
from django.apps import apps


def get_next_quiz_code(Quiz, base_code):
    """
    Generates next available quiz code like:
    PHY-MCQS-01, PHY-MCQS-02, ...
    """
    existing_codes = (
        Quiz.objects
        .filter(code__startswith=base_code)
        .values_list("code", flat=True)
    )

    max_num = 0
    for code in existing_codes:
        match = re.search(rf"{base_code}-(\d+)$", code)
        if match:
            num = int(match.group(1))
            max_num = max(max_num, num)

    return f"{base_code}-{max_num + 1:02d}"



# ======================================================
# MCQ IMPORT FUNCTION
# ======================================================

def import_mcqs_from_text(text):
    """
    Parses MCQs from raw text and inserts them into the database
    """

    # ---------- CONFIG ----------
    SUBJECT_CODE = "PHY"
    SUBJECT_NAME = "Physics"
    QUIZ_BASE_CODE = "PHY-MCQS"
    MARKS_PER_QUESTION = 2


    # ---------- LOAD MODELS ----------
    Subject = apps.get_model("api", "Subject")
    Quiz = apps.get_model("api", "Quiz")
    Question = apps.get_model("api", "Question")
    Choice = apps.get_model("api", "Choice")
    Teacher = apps.get_model("api", "Teacher")

    # ---------- VALIDATE ----------
    teacher = Teacher.objects.first()
    if not teacher:
        raise RuntimeError("❌ No Teacher found in database")

    subject, _ = Subject.objects.get_or_create(
        code=SUBJECT_CODE,
        defaults={"name": SUBJECT_NAME}
    )

    quiz_code = get_next_quiz_code(Quiz, QUIZ_BASE_CODE)

    quiz = Quiz.objects.create(
        code=quiz_code,
        subject=subject,
        teacher=teacher,
        score=0,  # temporary, updated after import
        date_created=timezone.now(),
    )


    # ---------- PARSE QUESTIONS ----------
    question_blocks = re.split(r"\n\s*\d+\.\s*", text)
    question_blocks = question_blocks[1:]  # drop header junk

    inserted = 0

    for block in question_blocks:
        # Question text (first non-empty line)
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue

        question_text = lines[0]

        # Options
        options = re.findall(r"\(\s*\d+\s*\)\s*(.+)", block)

        # Answer (very tolerant)
        ans_match = re.search(
            r"Answer\s*[:;]\s*\(?\s*(\d)\s*\)?",
            block,
            re.IGNORECASE
        )

        if len(options) < 2 or not ans_match:
            print("⚠ Skipped block:\n", block[:300], "\n---\n")
            continue


        correct_index = int(ans_match.group(1)) - 1

        question = Question.objects.create(
            quiz=quiz,
            text=question_text,
            marks=MARKS_PER_QUESTION
        )

        for idx, opt in enumerate(options):
            Choice.objects.create(
                question=question,
                text=opt.strip(),
                is_correct=(idx == correct_index)
            )

        inserted += 1

    # Update total marks dynamically
    quiz.score = inserted * MARKS_PER_QUESTION
    quiz.save(update_fields=["score"])



    return inserted


# ======================================================
# CLI ENTRYPOINT
# ======================================================

def main(argv):
    if len(argv) != 2:
        print("Usage:")
        print("  python import.py <path-to-mcq-text-file>")
        return 1

    file_path = argv[1]

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return 1

    with open(file_path, "r", encoding="utf-8") as f:
        raw_text = f.read()

    

    count = import_mcqs_from_text(raw_text)
    print(f"✅ Successfully imported {count} MCQs")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
