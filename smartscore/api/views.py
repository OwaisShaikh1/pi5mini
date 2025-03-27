from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Avg
from rest_framework.permissions import AllowAny

from .models import Student, Teacher, Branch, StudentQuiz
from .serializers import (
    StudentSerializer, TeacherSerializer, BranchSerializer,
    LeaderboardSerializer, StudentQuizSerializer
)


# User Signup View
@api_view(['POST'])
def signup(request):
    user_type = request.data.get("user_type")  # 'student' or 'teacher'
    code = request.data.get("code")
    name = request.data.get("name")
    password = request.data.get("password")
    branch_name = request.data.get("branch_name")  # Use branch_name instead of branch_id

    if not all([user_type, code, name, password, branch_name]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    branch = get_object_or_404(Branch, name=branch_name)  # Look up by name instead of id

    if user_type == "student":
        user = Student.objects.create_user(code=code, name=name, password=password, branch=branch)
    elif user_type == "teacher":
        user = Teacher.objects.create_user(code=code, name=name, password=password, branch=branch)
    else:
        return Response({"error": "Invalid user type."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": f"{user_type.capitalize()} account created successfully!"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated users to log in
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

    if user and user.check_password(password):
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": f"{user_type.capitalize()} logged in successfully!",
            "student_code": user.code if user_type == "student" else None,  # Return student code
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "redirect_url": "/dashboard/"
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)



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
