# Standard Library Imports
import json
import csv
import io

# Django Imports
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Avg
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.conf import settings
from random import randint

# Django REST Framework (DRF) Imports
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.tokens import RefreshToken

# Local App Imports (Models & Serializers)
from .models import (
    Student, Teacher, Branch, StudentQuiz, Quiz, Question, Choice, Topic, Subject
)
from .serializers import (
    StudentSerializer, TeacherSerializer, BranchSerializer,
    LeaderboardSerializer, StudentQuizSerializer, QuizSerializer
)


from rest_framework.generics import ListAPIView
from .models import Subject
from .serializers import SubjectSerializer

class SubjectListView(ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


# ==============================
# USER SIGNUP VIEW
# ==============================
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    print("Received Data:", json.dumps(request.data, indent=4))  # Debugging log

    user_type = request.data.get("user_type")
    code = request.data.get("code")
    name = request.data.get("name")
    password = request.data.get("password")
    branch_name = request.data.get("branch_name", None)  # Default to None
    email = request.data.get("email")

    if not all([user_type, code, name, password]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if user_type == "student":
        if not branch_name:
            return Response({"error": "Branch is required for students."}, status=status.HTTP_400_BAD_REQUEST)
        branch = get_object_or_404(Branch, name=branch_name)
        user = Student.objects.create_user(code=code, name=name, password=password, branch=branch)

    elif user_type == "teacher":
        user = Teacher.objects.create_user(code=code, name=name, password=password)

    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": f"{user_type.capitalize()} account created successfully!"}, status=status.HTTP_201_CREATED)


# ==============================
# USER LOGIN VIEW
# ==============================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    code = request.data.get("code")
    password = request.data.get("password")
    user_type = request.data.get("user_type")

    if not all([code, password, user_type]):
        return Response({"error": "Code, password, and user type are required."}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    if user_type == "student":
        user = Student.objects.filter(code=code).first()
    elif user_type == "teacher":
        user = Teacher.objects.filter(code=code).first()
    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    if not user:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({"error": "Invalid password."}, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        "message": f"{user_type.capitalize()} logged in successfully!",
        "user_code": user.code,
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "redirect_url": "/dashboard/"
    }, status=status.HTTP_200_OK)


# ==============================
# FORGOT PASSWORD
# ==============================
@api_view(['POST'])
@permission_classes([AllowAny])
def forgotpassword(request):
    code = request.data.get("code")
    email = request.data.get("email")
    user_type = request.data.get("user_type")

    user = None

    if user_type == "student":
        user = Student.objects.filter(code=code, email=email).first()
    elif user_type == "teacher":
        user = Teacher.objects.filter(code=code, email=email).first()
    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    if not user:
        return Response({"error": "User not found or email mismatch."}, status=status.HTTP_404_NOT_FOUND)

    # Generate a new temporary password
    temp_password = f"Temp{randint(1000, 9999)}"

    # Set new password (hashed automatically)
    user.password = make_password(temp_password)
    user.save()

    # Send the password to the user's email
    try:
        send_mail(
            subject="Your Temporary Password",
            message=f"Hello {user.name},\n\nHere is your temporary password: {temp_password}\nPlease log in and change it immediately.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({"error": "Failed to send email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Temporary password has been sent to your email."}, status=status.HTTP_200_OK)


# ==============================
# CHANGE PASSWORD
# ==============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changepassword(request):
    owais="owais"


# ==============================
# BRANCH LIST VIEW
# ==============================
class BranchListView(APIView):
    def get(self, request):
        branches = Branch.objects.all()
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==============================
# LEADERBOARD VIEW (Sorted by highest score)
# ==============================
@api_view(['GET'])
def get_leaderboard(request):
    student_quizzes = (
        StudentQuiz.objects
        .select_related("student", "quiz", "quiz__subject")
        .order_by("-score")
    )
    serializer = LeaderboardSerializer(student_quizzes, many=True)
    return Response(serializer.data)



# ==============================
# FETCH STUDENT'S ATTEMPTED QUIZZES
# ==============================
class StudentQuizListView(generics.ListAPIView):
    serializer_class = StudentQuizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        student_code = self.kwargs.get("student_code")
        if student_code:
            return StudentQuiz.objects.filter(student__code=student_code)
        return StudentQuiz.objects.all()
        


# ==============================
# QUIZ LIST VIEW
# ==============================
class QuizListView(ListAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


# ==============================
# CREATE QUIZ VIEW
# ==============================
@api_view(["POST"])
def create_quiz(request):
    try:
        data = request.data

        quiz_code = data.get("code")
        subject_code = data.get("subject_id")  # ✅ Use subject_code instead of ID
        score = int(data.get("score", 0))  
        date_created = data.get("date_created", timezone.now())  
        time_limit = int(data.get("time_limit", 30))  
        teachercode = data.get("teachercode")

        # Convert date_created if it's in string format
        if isinstance(date_created, str):
            date_created = timezone.datetime.fromisoformat(date_created)

        # Get Subject by `code`
        subject = Subject.objects.get(code=subject_code)  # ✅ Fix lookup

        # Get Teacher by `code`
        teacher = Teacher.objects.get(code=teachercode)  

        # Create Quiz
        quiz = Quiz.objects.create(
            code=quiz_code,
            subject=subject,
            score=score,
            date_created=date_created,
            time_limit=time_limit,
            teacher=teacher,
        )

        questions_data = data.get("questions", [])
        for q_data in questions_data:
            question_text = q_data.get("text")
            question_marks = q_data.get("marks")
            question_solution = q_data.get("solution", "")  # Optional solution
            
            question = Question.objects.create(
                quiz=quiz, 
                text=question_text, 
                marks=question_marks,
                solution=question_solution if question_solution else None
            )

            # Process Choices
            choices_data = q_data.get("choices", [])
            for c_data in choices_data:
                Choice.objects.create(
                    question=question,
                    text=c_data.get("text"),
                    is_correct=c_data.get("is_correct", False)
                )

        return JsonResponse({"message": "Quiz created successfully!", "quiz_id": quiz.code}, status=201)

    except Subject.DoesNotExist:
        return JsonResponse({"error": "Invalid subject code. Please check if the subject exists."}, status=400)

    except Teacher.DoesNotExist:
        return JsonResponse({"error": "Invalid teacher code. Please check if the teacher exists."}, status=400)

    except ValueError:
        return JsonResponse({"error": "Invalid data format. Ensure numerical values for score/time_limit."}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)     


# ==============================
# UPLOAD AND PARSE CSV FOR QUIZ
# ==============================
@api_view(["POST"])
@permission_classes([AllowAny])  # TODO: Change to IsAuthenticated and check for Teacher role
def upload_quiz_csv(request):
    """
    Upload a CSV file and parse questions for quiz creation.
    Accepts flexible CSV formats with various column naming conventions.
    Returns parsed questions as JSON (does not save to database).
    """
    
    def normalize_column(col):
        """Normalize column name: lowercase, remove spaces/underscores/hyphens"""
        return col.lower().replace(' ', '').replace('_', '').replace('-', '')
    
    def find_column(headers, possible_names):
        """Find column by matching against possible name variations"""
        normalized_headers = {normalize_column(h): h for h in headers}
        for name in possible_names:
            normalized = normalize_column(name)
            if normalized in normalized_headers:
                return normalized_headers[normalized]
        return None
    
    try:
        if 'file' not in request.FILES:
            return JsonResponse({"error": "No file provided."}, status=400)
        
        csv_file = request.FILES['file']
        
        # Validate file type
        if not csv_file.name.endswith('.csv'):
            return JsonResponse({"error": "File must be a CSV file."}, status=400)
        
        # Validate file size (max 5MB)
        if csv_file.size > 5 * 1024 * 1024:
            return JsonResponse({"error": "File size exceeds 5MB limit."}, status=400)
        
        # Read and decode CSV file
        try:
            file_data = csv_file.read().decode('utf-8')
        except UnicodeDecodeError:
            return JsonResponse({"error": "Invalid file encoding. Please use UTF-8."}, status=400)
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(file_data))
        headers = csv_reader.fieldnames
        
        if not headers:
            return JsonResponse({"error": "CSV file is empty or has no headers."}, status=400)
        
        # Flexible column mapping
        question_col = find_column(headers, ['question', 'Question', 'question_text', 'Question Text', 'q'])
        option_a_col = find_column(headers, ['option a', 'Option A', 'option_a', 'optiona', 'OptionA', 'a', 'choice_a'])
        option_b_col = find_column(headers, ['option b', 'Option B', 'option_b', 'optionb', 'OptionB', 'b', 'choice_b'])
        option_c_col = find_column(headers, ['option c', 'Option C', 'option_c', 'optionc', 'OptionC', 'c', 'choice_c'])
        option_d_col = find_column(headers, ['option d', 'Option D', 'option_d', 'optiond', 'OptionD', 'd', 'choice_d'])
        option_e_col = find_column(headers, ['option e', 'Option E', 'option_e', 'optione', 'OptionE', 'e', 'choice_e'])
        answer_col = find_column(headers, ['correct answer', 'Correct Answer', 'answer', 'Answer', 'correct', 'Correct', 'correct_answer'])
        marks_col = find_column(headers, ['marks', 'Marks', 'points', 'Points', 'score', 'Score'])
        solution_col = find_column(headers, ['solution', 'Solution', 'explanation', 'Explanation', 'hint', 'Hint'])
        
        # Validate required columns
        if not question_col:
            return JsonResponse({
                "error": "Could not find question column. Expected column names: 'question', 'Question', 'question_text', etc.",
                "found_headers": list(headers)
            }, status=400)
        
        if not option_a_col or not option_b_col:
            return JsonResponse({
                "error": "Could not find option columns. Expected at least 'Option A' and 'Option B' (or 'option_a', 'option_b', etc.).",
                "found_headers": list(headers)
            }, status=400)
        
        if not answer_col:
            return JsonResponse({
                "error": "Could not find correct answer column. Expected: 'answer', 'Correct Answer', 'correct_answer', etc.",
                "found_headers": list(headers)
            }, status=400)
        
        # Parse questions
        questions = []
        skipped_count = 0
        
        for idx, row in enumerate(csv_reader, start=2):  # start=2 because row 1 is header
            question_text = row.get(question_col, '').strip()
            option_a = row.get(option_a_col, '').strip()
            option_b = row.get(option_b_col, '').strip()
            option_c = row.get(option_c_col, '').strip() if option_c_col else ''
            option_d = row.get(option_d_col, '').strip() if option_d_col else ''
            option_e = row.get(option_e_col, '').strip() if option_e_col else ''
            correct_answer = row.get(answer_col, '').strip().upper()
            marks = row.get(marks_col, '2').strip() if marks_col else '2'
            solution = row.get(solution_col, '').strip() if solution_col else ''
            
            # Skip if essential fields are empty
            if not question_text or not option_a or not option_b:
                skipped_count += 1
                continue
            
            # Skip if "None" appears in options
            if 'none' in [option_a.lower(), option_b.lower(), option_c.lower(), option_d.lower(), option_e.lower()]:
                skipped_count += 1
                continue
            
            # Parse correct answer (support A-E or 1-5)
            correct_index = -1
            if correct_answer in ['A', '1']:
                correct_index = 0
            elif correct_answer in ['B', '2']:
                correct_index = 1
            elif correct_answer in ['C', '3']:
                correct_index = 2
            elif correct_answer in ['D', '4']:
                correct_index = 3
            elif correct_answer in ['E', '5']:
                correct_index = 4
            else:
                # If invalid correct answer, skip question
                skipped_count += 1
                continue
            
            # Parse marks (default to 2)
            try:
                marks_value = int(marks) if marks else 2
            except ValueError:
                marks_value = 2
            
            # Build choices array (include all non-empty options)
            all_options = [option_a, option_b, option_c, option_d, option_e]
            choices = []
            for i, option in enumerate(all_options):
                if option:  # Only include non-empty options
                    choices.append({
                        "text": option,
                        "is_correct": i == correct_index
                    })
            
            # Ensure at least 2 choices
            if len(choices) < 2:
                skipped_count += 1
                continue
            
            question_obj = {
                "text": question_text,
                "marks": marks_value,
                "choices": choices
            }
            
            # Add solution if provided
            if solution:
                question_obj["solution"] = solution
            
            questions.append(question_obj)
        
        if not questions:
            return JsonResponse({
                "error": "No valid questions found in CSV file.",
                "skipped": skipped_count
            }, status=400)
        
        return JsonResponse({
            "success": True,
            "message": f"Successfully parsed {len(questions)} questions.",
            "questions": questions,
            "count": len(questions),
            "skipped": skipped_count
        }, status=200)
    
    except Exception as e:
        return JsonResponse({"error": f"Failed to process CSV: {str(e)}"}, status=500)
        
        
# GET QUIZ DATA FOR ATTEMPT
# ==============================
@api_view(['GET'])
def get_quiz(request, quiz_code):
    quiz = get_object_or_404(Quiz, code=quiz_code)
    serializer = QuizSerializer(quiz)
    return Response(serializer.data)


# ==============================
# TAKE QUIZ VIEW
# ==============================
class TakeQuizView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, quiz_code):
        quiz = get_object_or_404(Quiz, code=quiz_code)
        questions = Question.objects.filter(quiz=quiz).prefetch_related('choices')

        # Calculate total score from question marks
        total_score = sum(q.marks for q in questions)

        quiz_data = {
            "code": quiz.code,
            "title": quiz.subject.name if quiz.subject else "No Subject",  # ✅ Updated from topic to subject
            "total_score": total_score,
            "duration": quiz.time_limit,
            "questions": [
                {
                    "id": question.id,
                    "text": question.text,
                    "marks": question.marks,
                    "choices": [
                        {"id": choice.id, "text": choice.text}
                        for choice in question.choices.all()
                    ]
                }
                for question in questions
            ]
        }

        return Response(quiz_data, status=status.HTTP_200_OK)
# ==============================
# ATTEMPT QUIZ VIEW
# ==============================
class AttemptQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quiz_code = request.data.get("quiz_code")
        student = request.user  # Already authenticated

        if not quiz_code:
            return Response({"error": "Quiz code is required."}, status=400)

        quiz = Quiz.objects.filter(code=quiz_code).first()
        if not quiz:
            return Response({"error": "Quiz not found."}, status=404)

        # 🧠 Check if an unsubmitted attempt exists
        unsubmitted_attempt = StudentQuiz.objects.filter(
            student=student,
            quiz=quiz,
            submitted=False
        ).first()

        if unsubmitted_attempt:
            return Response({
                "message": "Resuming your active quiz attempt.",
                "attempt_id": unsubmitted_attempt.id
            })

        # 🆕 Start a new attempt
        new_attempt = StudentQuiz.objects.create(
            student=student,
            quiz=quiz,
            score=0,
            submitted=False,
            attempt_time=timezone.now()
        )

        return Response({
            "message": "New quiz attempt started.",
            "attempt_id": new_attempt.id
        })

# ==============================
# GET QUIZ FOR ATTEMPT VIEW
# ==============================
class GetQuizForAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_code, attempt_id):
        student = request.user.student

        attempt = StudentQuiz.objects.filter(id=attempt_id, student=student).first()
        if not attempt:
            return Response({"error": "Attempt not found."}, status=404)

        quiz = attempt.quiz
        questions = quiz.questions.all()

        quiz_data = {
            "quiz_code": quiz.code,
            "attempt_id": attempt.id,
            "questions": [
                {
                    "id": question.id,
                    "text": question.text,
                    "choices": [
                        {"id": choice.id, "text": choice.text} 
                        for choice in question.choices.all()
                    ]
                }
                for question in questions
            ]
        }

        return Response(quiz_data)


# ==============================
# SUBMIT QUIZ VIEW
# ==============================
class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        quiz_id = data.get("quiz_id")
        answers = data.get("answers", {})

        quiz = get_object_or_404(Quiz, code=quiz_id)
        student = request.user

        total_score = 0
        total_possible_marks = 0
        questions_data = {}  # Changed to dict keyed by question ID
        correct_count = 0

        for question in Question.objects.filter(quiz=quiz).prefetch_related('choices'):
            correct_choice = question.choices.filter(is_correct=True).first()
            selected_choice_id = int(answers.get(str(question.id), 0))

            is_correct = (
                correct_choice and selected_choice_id == correct_choice.id
            )

            if is_correct:
                total_score += question.marks
                correct_count += 1
            
            # Add to total possible marks
            total_possible_marks += question.marks

            questions_data[question.id] = {
                "id": question.id,
                "text": question.text,
                "marks": question.marks,
                "correct_answer": correct_choice.text if correct_choice else None,
                "selected_choice_id": selected_choice_id,
                "is_correct": is_correct,
                "choices": [
                    {
                        "id": choice.id,
                        "text": choice.text,
                        "is_correct": choice.is_correct,
                    }
                    for choice in question.choices.all()
                ],
            }

        StudentQuiz.objects.create(student=student, quiz=quiz, score=total_score)

        return Response(
            {
                "message": "Quiz submitted successfully!",
                "score": total_score,
                "totalMarks": total_possible_marks,
                "totalQuestions": quiz.questions.count(),
                "correctAnswers": correct_count,
                "questionResults": questions_data,
            },
            status=status.HTTP_200_OK,
        )


# ==============================
# GET STUDENT PROFILE VIEW
# ==============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_profile(request, student_code):
    try:
        student = get_object_or_404(Student, code=student_code)
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==============================
# GET TEACHER PROFILE VIEW
# ==============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_profile(request, teachercode):
    try:
        print(f"🚀 Request Type: {type(request)}")

        # Debugging print
        print(f"Fetching teacher with code: {teachercode}")

        # Fetch teacher
        teacher = get_object_or_404(Teacher, code=teachercode)
        teacher_serializer = TeacherSerializer(teacher)

        # Fetch subjects related to the teacher
        subjects = Subject.objects.all()
        print(f"Subjects found: {subjects}")  # Debugging step

        # Serialize subjects
        subject_serializer = SubjectSerializer(subjects, many=True)

        # Build response data
        teacher_data = teacher_serializer.data
        teacher_data["subjects"] = subject_serializer.data

        return Response(teacher_data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"❌ Error fetching teacher profile: {str(e)}")  # Debugging
        return Response({"error": f"Failed to fetch teacher profile: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subjects(request):
    user = request.user
    user_type = request.query_params.get('type')

    print(f"🔍 user: {user}")
    print(f"🔍 user_type: {user_type}")

    try:
        if user_type == "student":
            student = Student.objects.get(code=user.code)
            print(f"✅ Found student: {student}")
            subjects = Subject.objects.filter(branch=student.branch)

        elif user_type == "teacher":
            teacher = Teacher.objects.get(code=user.code)
            print(f"✅ Found teacher: {teacher}")
            subjects = Subject.objects.all()

        else:
            return Response({"error": "Invalid or missing user type."}, status=400)

        subject_serializer = SubjectSerializer(subjects, many=True)
        return Response({"subjects": subject_serializer.data})

    except Student.DoesNotExist:
        return Response({"error": "Student profile not found."}, status=404)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher profile not found."}, status=404)


class StudentListView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        students = Student.objects.all().select_related("branch")  # Optimize query by selecting related branch data
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)