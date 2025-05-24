# Standard Library Imports
import json

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
            question = Question.objects.create(quiz=quiz, text=question_text, marks=question_marks)

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

        quiz_data = {
            "code": quiz.code,
            "title": quiz.subject.name if quiz.subject else "No Subject",  # ✅ Updated from topic to subject
            "total_score": quiz.score,
            "duration": quiz.time_limit,
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
        questions_data = []
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

            question_info = {
                "id": question.id,
                "text": question.text,
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
            questions_data.append(question_info)

        StudentQuiz.objects.create(student=student, quiz=quiz, score=total_score)

        return Response(
            {
                "message": "Quiz submitted successfully!",
                "score": total_score,
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