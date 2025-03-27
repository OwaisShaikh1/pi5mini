from rest_framework import serializers
from .models import Student, Teacher, Quiz, StudentQuiz, Question, Choice, Branch
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


# Student Serializer
class StudentSerializer(serializers.ModelSerializer):
    branch = serializers.CharField(source="branch.name", read_only=True)  # Serialize branch name

    class Meta:
        model = Student
        fields = ["code", "name", "branch", "average_score"]


# Teacher Serializer
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ["code", "name", "subject"]


# Branch Serializer
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ["name"]  # Removing 'id' since name is primary key


# Quiz Serializer
class QuizSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source="teacher.name")  # Related teacher name

    class Meta:
        model = Quiz
        fields = ["code", "topic", "score", "teacher_name"]


# StudentQuiz Serializer (Leaderboard)
class StudentQuizSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.name")  # Student name
    branch = serializers.ReadOnlyField(source="student.branch.name")  # Branch name
    subject = serializers.ReadOnlyField(source="quiz.topic.subject.name")  # Subject name
    topic = serializers.ReadOnlyField(source="quiz.topic.name")  # Topic name
    quiz_code = serializers.ReadOnlyField(source="quiz.code")
    quiz_title = serializers.ReadOnlyField(source="quiz.topic.name")  # Using topic as quiz title
    percentage_score = serializers.SerializerMethodField()  # Calculate percentage dynamically

    class Meta:
        model = StudentQuiz
        fields = [
            "student_name",
            "branch",
            "subject",
            "topic",
            "quiz_code",
            "quiz_title",
            "score",
            "percentage_score",
        ]

    def get_percentage_score(self, obj):
        """ Calculate percentage score dynamically """
        return round((obj.score / obj.quiz.score) * 100, 2) if obj.quiz.score else 0


# Question Serializer
class QuestionSerializer(serializers.ModelSerializer):
    quiz_title = serializers.ReadOnlyField(source="quiz.topic.name")  # Using topic name for quiz

    class Meta:
        model = Question
        fields = ["id", "quiz", "quiz_title", "text"]


# Choice Serializer
class ChoiceSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source="question.text")  # Related question text

    class Meta:
        model = Choice
        fields = ["id", "question", "question_text", "text", "is_correct"]


# Custom Token Serializer (JWT)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["code"] = user.code  # Include 'code' in the token payload
        return token

    def validate(self, attrs):
        code = attrs.get("code")  # Authenticate using 'code'
        password = attrs.get("password")

        user = authenticate(code=code, password=password)
        if not user:
            raise serializers.ValidationError("Invalid User Code or Password")

        return super().validate(attrs)


# Leaderboard Serializer
class LeaderboardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="student.name", default="N/A")  # Fetch student name
    marks = serializers.FloatField(source="score", default=0)  # Fetch marks from StudentQuiz
    subject = serializers.CharField(source="quiz.topic.subject.name", default="N/A")  # Fetch subject name

    class Meta:
        model = StudentQuiz
        fields = ["name", "marks", "subject"]