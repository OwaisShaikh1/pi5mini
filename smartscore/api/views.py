# Standard Library Imports
import json

# Django Imports
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.db.models import Avg

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
    Student, Teacher, Branch, StudentQuiz, Quiz, Question, Choice, Topic
)
from .serializers import (
    StudentSerializer, TeacherSerializer, BranchSerializer,
    LeaderboardSerializer, StudentQuizSerializer, QuizSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    print("Received Data:", json.dumps(request.data, indent=4))  # Debugging log

    user_type = request.data.get("user_type")
    code = request.data.get("code")
    name = request.data.get("name")
    password = request.data.get("password")
    branch_name = request.data.get("branch_name", None)  # Default to None

    if not all([user_type, code, name, password]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if user_type == "student":
        if not branch_name:
            return Response({"error": "Branch is required for students."}, status=status.HTTP_400_BAD_REQUEST)
        branch = get_object_or_404(Branch, name=branch_name)
        user = Student.objects.create_user(code=code, name=name, password=password, branch=branch)

    elif user_type == "teacher":
        # Do NOT pass a branch
        user = Teacher.objects.create_user(code=code, name=name, password=password)

    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": f"{user_type.capitalize()} account created successfully!"}, status=status.HTTP_201_CREATED)


# ================================
# USER LOGIN VIEW
# ================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    code = request.data.get("code")
    password = request.data.get("password")
    user_type = request.data.get("user_type")  # 'student' or 'teacher'

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


# Branch List View
class BranchListView(APIView):
    
    def get(self, request):
        branches = Branch.objects.all()
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Get Leaderboard (Sorted by highest score)
@api_view(['GET'])
def get_leaderboard(request):
    student_quizzes = (
        StudentQuiz.objects
        .select_related("student", "quiz__topic__subject")  # Ensures efficient foreign key joins
        .order_by("-score")  # Sorting by highest score
    )
    serializer = LeaderboardSerializer(student_quizzes, many=True)
    return Response(serializer.data)


# Fetch Student's Attempted Quizzes
class StudentQuizListView(generics.ListAPIView):
    serializer_class = StudentQuizSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users access

    def get_queryset(self):
        student_code = self.kwargs["student_code"]  # Get student code from URL
        return StudentQuiz.objects.filter(student__code=student_code)  # Filter quizzes attempted by the student)




class QuizListView(ListAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


#Create Quiz View
from django.utils import timezone

@api_view(["POST"])
def create_quiz(request):
    try:
        data = request.data

        # Extract data from request
        quiz_code = data.get("code")
        topic_id = data.get("topic_id")
        score = data.get("score", 0)
        date_created = data.get("date_created", timezone.now())  # Defaults to now
        time_limit = data.get("time_limit", 30)  # Defaults to 30 minutes
        teacherCode = data.get("teachercode")


        # Get Topic object
        topic = Topic.objects.get(pk=topic_id)

        # Create Quiz
        quiz = Quiz.objects.create(
            code=quiz_code,
            topic=topic,
            score=score,
            date_created=date_created,
            time_limit=time_limit,
            teacher_code=teachercode,
        )

        return JsonResponse({"message": "Quiz created successfully!", "quiz_id": quiz.code}, status=201)

    except Topic.DoesNotExist:
        return JsonResponse({"error": "Invalid topic ID"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)




from django.shortcuts import get_object_or_404
from api.models import Quiz  # Use the correct model name
from api.serializers import QuizSerializer
from rest_framework.response import Response

@api_view(['GET'])
def get_quiz(request, quiz_code):
    quiz = get_object_or_404(Quiz, code=quiz_code)
    serializer = QuizSerializer(quiz)
    return Response(serializer.data)

class TakeQuizView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, quiz_code):
        quiz = get_object_or_404(Quiz, code=quiz_code)
        questions = Question.objects.filter(quiz=quiz).prefetch_related('choices')

        quiz_data = {
            "code": quiz.code,
            "title": quiz.topic.name,
            "total_score": quiz.score,
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

class AttemptQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quiz_code = request.data.get("quiz_code")
        student = request.user

        if not quiz_code:
            return Response({"error": "Quiz code is required."}, status=status.HTTP_400_BAD_REQUEST)

        quiz = get_object_or_404(Quiz, code=quiz_code)

        # ✅ Check if student has already attempted but not submitted
        existing_attempt = StudentQuiz.objects.filter(student=student, quiz=quiz).first()

        if existing_attempt and existing_attempt.submitted:
            return Response({"error": "You have already attempted this quiz."}, status=status.HTTP_400_BAD_REQUEST)

        if existing_attempt:
            return Response({"message": "Resuming quiz attempt.", "attempt_id": existing_attempt.id}, status=status.HTTP_200_OK)

        # ✅ Create a new attempt only if no previous attempt exists
        attempt = StudentQuiz.objects.create(student=student, quiz=quiz, score=0, submitted=False)

        return Response({"message": "Quiz attempt started!", "attempt_id": attempt.id}, status=status.HTTP_200_OK)
        

# Submit a quiz and calculate score
class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        quiz_id = data.get("quiz_id")
        answers = data.get("answers", {})

        quiz = get_object_or_404(Quiz, id=quiz_id)
        student = request.user

        total_score = 0
        max_score = quiz.score
        correct_answers = {q.id: q.correct_choice_id for q in Question.objects.filter(quiz=quiz)}

        # Calculate score
        for question_id, selected_choice in answers.items():
            if correct_answers.get(int(question_id)) == selected_choice:
                total_score += max_score / len(correct_answers)  # Distribute score evenly

        # Save student quiz attempt
        StudentQuiz.objects.create(student=student, quiz=quiz, score=total_score)

        return Response({"message": "Quiz submitted successfully!", "score": total_score}, status=status.HTTP_200_OK)

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]  # Restrict access to authenticated users

    def get(self, request):
        students = Student.objects.all().select_related("branch")  # Optimize queries with select_related
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=200)

@api_view(['GET'])  # ✅ Ensure it's recognized as an API view
@permission_classes([IsAuthenticated])  # ✅ Require authentication
def get_student_profile(request, student_code):
    try:
        student = get_object_or_404(Student, code=student_code)
        serializer = StudentSerializer(student)

        return Response(serializer.data, status=status.HTTP_200_OK)  # ✅ Proper DRF response

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  # Handle errors


@api_view(['GET'])  # ✅ Ensure it's recognized as an API view
@permission_classes([IsAuthenticated])  # ✅ Require authentication
def get_teacher_profile(request, student_code):
    try:
        teacher = get_object_or_404(Student, code=teacher_code)
        serializer = TeacherSerializer(teacher)

        return Response(serializer.data, status=status.HTTP_200_OK)  # ✅ Proper DRF response

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  # Handle errors