import csv
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.apps import apps


class Command(BaseCommand):
    help = "Import MCQs from CSV file (output.csv format)"

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Path to CSV file")
        parser.add_argument("--quiz-code", type=str, help="Quiz code", default="QUIZ-CSV-01")
        parser.add_argument("--subject-code", type=str, help="Subject code", default="MATH")
        parser.add_argument("--subject-name", type=str, help="Subject name", default="Mathematics")
        parser.add_argument("--marks-per-question", type=int, help="Marks per question", default=2)

    def handle(self, *args, **options):
        file_path = options["file_path"]
        quiz_code = options["quiz_code"]
        subject_code = options["subject_code"]
        subject_name = options["subject_name"]
        marks_per_question = options["marks_per_question"]

        # Resolve models
        Subject = apps.get_model('api', 'Subject')
        Quiz = apps.get_model('api', 'Quiz')
        Question = apps.get_model('api', 'Question')
        Choice = apps.get_model('api', 'Choice')
        Teacher = apps.get_model('api', 'Teacher')
        Branch = apps.get_model('api', 'Branch')

        # Get or create teacher
        teacher = Teacher.objects.first()
        if not teacher:
            self.stdout.write(self.style.ERROR("❌ No Teacher found in DB. Please create a teacher first."))
            return

        # Get or create branch (needed for subject)
        branch, _ = Branch.objects.get_or_create(name='general')

        # Get or create subject
        subject, _ = Subject.objects.get_or_create(
            code=subject_code,
            defaults={"name": subject_name, "branch": branch}
        )

        # Delete existing quiz if it exists (to avoid duplicates)
        Quiz.objects.filter(code=quiz_code).delete()

        # Read CSV and count questions
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            questions_data = list(reader)

        total_marks = len(questions_data) * marks_per_question

        # Create quiz
        quiz = Quiz.objects.create(
            code=quiz_code,
            subject=subject,
            teacher=teacher,
            score=total_marks,
            date_created=timezone.now(),
            time_limit=len(questions_data) * 2  # 2 minutes per question
        )

        inserted_count = 0
        skipped_count = 0

        # Import questions
        for row in questions_data:
            question_text = row.get('Question', '').strip()
            option_a = row.get('Option A', '').strip()
            option_b = row.get('Option B', '').strip()
            option_c = row.get('Option C', '').strip()
            option_d = row.get('Option D', '').strip()
            correct_answer = row.get('Correct Answer', '').strip().lower()

            # Skip if question or options are empty
            if not question_text or not all([option_a, option_b, option_c, option_d]):
                skipped_count += 1
                continue

            # Skip if "None" appears in options
            if 'none' in [option_a.lower(), option_b.lower(), option_c.lower(), option_d.lower()]:
                skipped_count += 1
                continue

            # Create question
            question = Question.objects.create(
                quiz=quiz,
                text=question_text,
                marks=marks_per_question
            )

            # Create choices
            options = [
                ('a', option_a),
                ('b', option_b),
                ('c', option_c),
                ('d', option_d),
            ]

            for option_letter, option_text in options:
                Choice.objects.create(
                    question=question,
                    text=option_text,
                    is_correct=(option_letter == correct_answer)
                )

            inserted_count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Successfully imported {inserted_count} questions"))
        if skipped_count > 0:
            self.stdout.write(self.style.WARNING(f"⚠️  Skipped {skipped_count} questions (missing data or invalid)"))
        self.stdout.write(self.style.SUCCESS(f"📝 Quiz Code: {quiz_code}"))
        self.stdout.write(self.style.SUCCESS(f"📚 Subject: {subject_name} ({subject_code})"))
        self.stdout.write(self.style.SUCCESS(f"💯 Total Marks: {total_marks}"))
