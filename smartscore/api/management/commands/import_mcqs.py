import re
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.apps import apps


class Command(BaseCommand):
    help = "Import MCQs from a raw text file"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to MCQ text file")

    def handle(self, *args, **options):
        file_path = options["file_path"]

        with open(file_path, "r", encoding="utf-8") as f:
            raw_text = f.read()

        inserted = self.import_mcqs(raw_text)
        self.stdout.write(self.style.SUCCESS(f"✅ MCQs imported successfully ({inserted} questions)"))

    def import_mcqs(self, text):
        # ---------- CONFIG ----------
        SUBJECT_CODE = "PHY"
        SUBJECT_NAME = "Physics"
        QUIZ_CODE = "PHY-MCQS-01"
        TOTAL_MARKS = 100

        # Resolve models via app registry to avoid import path issues
        Subject = apps.get_model('api', 'Subject')
        Quiz = apps.get_model('api', 'Quiz')
        Question = apps.get_model('api', 'Question')
        Choice = apps.get_model('api', 'Choice')
        Teacher = apps.get_model('api', 'Teacher')

        # Pick any existing teacher
        teacher = Teacher.objects.first()
        if not teacher:
            raise Exception("No Teacher found in DB")

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

        # ---------- PARSING ----------
        question_blocks = re.split(r"\n\s*\d+\.\s*", text)
        question_blocks = question_blocks[1:]  # remove junk before Q1

        inserted_count = 0

        for block in question_blocks:
            question_text_match = re.match(r"(.*?)(\n|\r)", block, re.S)
            if not question_text_match:
                continue

            question_text = question_text_match.group(1).strip()

            options = re.findall(r"\(\d\)\s*(.*)", block)
            answer_match = re.search(r"Answer:\s*\((\d)\)", block)

            if not options or not answer_match:
                continue

            correct_index = int(answer_match.group(1)) - 1

            question = Question.objects.create(
                quiz=quiz,
                text=question_text,
                marks=2
            )

            for idx, opt_text in enumerate(options):
                Choice.objects.create(
                    question=question,
                    text=opt_text.strip(),
                    is_correct=(idx == correct_index)
                )

            inserted_count += 1

        return inserted_count
