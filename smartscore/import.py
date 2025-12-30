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
    QUIZ_CODE = "PHY-MCQS-01"
    TOTAL_MARKS = 100
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

    quiz, _ = Quiz.objects.get_or_create(
        code=QUIZ_CODE,
        defaults={
            "subject": subject,
            "teacher": teacher,
            "score": TOTAL_MARKS,
            "date_created": timezone.now(),
        }
    )

    # ---------- PARSE QUESTIONS ----------
    question_blocks = re.split(r"\n\s*\d+\.\s*", text)
    question_blocks = question_blocks[1:]  # drop header junk

    inserted = 0

    for block in question_blocks:
        # Question text = first line
        q_match = re.match(r"(.*?)(\n|\r)", block, re.S)
        if not q_match:
            continue

        question_text = q_match.group(1).strip()

        # Options
        options = re.findall(r"\(\d\)\s*(.*)", block)

        # Answer
        ans_match = re.search(r"Answer:\s*\((\d)\)", block)

        if not options or not ans_match:
            continue

        correct_index = int(ans_match.group(1)) - 1

        # ---------- CREATE QUESTION ----------
        question = Question.objects.create(
            quiz=quiz,
            text=question_text,
            marks=MARKS_PER_QUESTION
        )

        # ---------- CREATE OPTIONS ----------
        for idx, opt in enumerate(options):
            Choice.objects.create(
                question=question,
                text=opt.strip(),
                is_correct=(idx == correct_index)
            )

        inserted += 1

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
