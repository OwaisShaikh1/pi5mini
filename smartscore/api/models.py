from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.hashers import make_password


# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, code, name, password=None, **extra_fields):
        if not code:
            raise ValueError("The Code field must be set")
        user = self.model(code=code, name=name, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, code, name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(code, name, password, **extra_fields)


# Abstract Base User Model
class BaseUser(AbstractBaseUser, PermissionsMixin):
    code = models.CharField(max_length=10, unique=True, primary_key=True)  # Unique identifier
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)  # Hashed password
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Required for admin panel access

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="%(class)s_groups",  # Unique related_name for each subclass
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="%(class)s_permissions",  # Unique related_name for each subclass
        blank=True,
    )

    USERNAME_FIELD = "code"  # Authenticate using 'code'
    REQUIRED_FIELDS = ["name"]

    objects = CustomUserManager()

    class Meta:
        abstract = True  # No database table will be created for this model

    def save(self, *args, **kwargs):
        if not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# Admin Model
class Admin(BaseUser):
    role = models.CharField(max_length=50, default="Admin")
    is_staff = models.BooleanField(default=True)  # Required for Django admin
    is_superuser = models.BooleanField(default=True)  # Superuser privileges


# Teacher Model
class Teacher(BaseUser):
    subject = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=True)  # Teachers might need staff permissions


# Branch Model
class Branch(models.Model):
    name = models.CharField(max_length=10, primary_key=True, default='comps')

    def __str__(self):
        return self.name


# Student Model
class Student(BaseUser):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, to_field='name')
    average_score = models.FloatField(default=0)

    def calculate_average(self):
        """ Calculate average score of student across all quizzes """
        quizzes = StudentQuiz.objects.filter(student=self)
        if quizzes.exists():
            total_score = sum(q.score for q in quizzes)
            self.average_score = total_score / quizzes.count()
            self.save()


# Subject Model
class Subject(models.Model):
    code = models.CharField(max_length=10, primary_key=True)  # Unique Subject Code
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Topic Model
class Topic(models.Model):
    code = models.CharField(max_length=10, primary_key=True)  # Unique Topic Code
    name = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)  # Each topic belongs to a subject
    weight = models.FloatField()  # Topic weight in grading

    def __str__(self):
        return self.name


# Quiz Model
class Quiz(models.Model):
    code = models.CharField(max_length=10, primary_key=True)  # Unique Quiz Code
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)  # Foreign key linking to Topic
    score = models.IntegerField()  # Maximum score of the quiz

    def __str__(self):
        return f"Quiz {self.code} - Score: {self.score}"


# StudentQuiz Model (Student's performance in a Quiz)
class StudentQuiz(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)  # Student who took the quiz
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)  # The quiz they took
    score = models.IntegerField()  # Student's obtained score

    def get_percentage_score(self):
        """ Returns student's percentage score for the quiz """
        return (self.score / self.quiz.score) * 100 if self.quiz.score else 0

    def __str__(self):
        return f"{self.student.name} - {self.quiz.code} ({self.score}/{self.quiz.score})"


# Question Model
class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")  # Link to Quiz
    text = models.TextField()  # Question text

    def __str__(self):
        return self.text


# Choice Model (MCQ options)
class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")  # Link to Question
    text = models.CharField(max_length=255)  # Answer choice text
    is_correct = models.BooleanField(default=False)  # Marks the correct answer

    def __str__(self):
        return self.text
