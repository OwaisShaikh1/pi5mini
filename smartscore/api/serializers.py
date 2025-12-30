from rest_framework import serializers
from .models import Student, Teacher, Quiz, StudentQuiz, Question, Choice, Branch
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


# Student Serializer
class StudentSerializer(serializers.ModelSerializer):
    branch = serializers.CharField(source="branch.name", read_only=True)  # Serialize branch name

    class Meta:
        model = Student
        fields = ["code", "name", "branch", "average_score", "email"]


# Teacher Serializer
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ["code", "name", "subject", "email"]


# Branch Serializer
class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ["name"]  # Removing 'id' since name is primary key


class QuizSerializer(serializers.ModelSerializer):
    teachercode = serializers.CharField(write_only=True)  # Accept teachercode from frontend
    teacher_code = serializers.ReadOnlyField(source="teacher.code")  # Return teacher code in response

    class Meta:
        model = Quiz
        fields = ["code", "topic", "score", "teachercode", "teacher_code"]  # ✅ Use teacher_code instead of teacher_name

    def create(self, validated_data):
        teachercode = validated_data.pop("teachercode", None)
        
        # Fetch Teacher instance
        teacher_instance = Teacher.objects.get(code=teachercode)  # ✅ Ensure teacher exists

        # Create the quiz with the resolved teacher
        quiz = Quiz.objects.create(teacher=teacher_instance, **validated_data)
        return quiz


# StudentQuiz Serializer (Leaderboard)
class StudentQuizSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.name")  # Student name
    branch = serializers.ReadOnlyField(source="student.branch.name")  # Branch name
    subject = serializers.ReadOnlyField(source="quiz.subject.name")  # ✅ Subject directly from Quiz
    quiz_code = serializers.ReadOnlyField(source="quiz.code")
    quiz_title = serializers.ReadOnlyField(source="quiz.subject.name")  # ✅ Using subject as title (since topic is removed)
    percentage_score = serializers.SerializerMethodField()  # Calculate percentage dynamically

    class Meta:
        model = StudentQuiz
        fields = [
            "student_name",
            "branch",
            "subject",
            "quiz_code",
            "quiz_title",
            "score",
            "percentage_score",
        ]

    def get_percentage_score(self, obj):
        """ Calculate percentage score dynamically """
        total_marks = sum(q.marks for q in obj.quiz.questions.all())
        return round((obj.score / total_marks) * 100, 2) if total_marks else 0

from rest_framework import serializers
from .models import Subject

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'  # Returns all fields from Subject model




# Question Serializer
class QuizSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source="subject.name")  # Get topic name instead of ID

    class Meta:
        model = Quiz
        fields = ["code", "subject", "score", "time_limit"]


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
    subject = serializers.CharField(source="quiz.subject.name", default="N/A")  # Fetch subject name

    class Meta:
        model = StudentQuiz
        fields = ["name", "marks", "subject"]