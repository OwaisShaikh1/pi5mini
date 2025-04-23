from django.urls import path
from .views import (
    signup, 
    login, 
    BranchListView, 
    get_leaderboard, 
    StudentQuizListView, 
    create_quiz, 
    get_quiz, 
    QuizListView, 
    TakeQuizView, 
    AttemptQuizView,
    SubmitQuizView,
    StudentListView,
    get_student_profile,
    get_teacher_profile
)

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path("branches/", BranchListView.as_view(), name="branch-list"),
    path('leaderboard/', get_leaderboard, name='leaderboard'),
    path("student/<str:student_code>/quizzes/", StudentQuizListView.as_view(), name="student-quizzes"),
    path("create-quiz/", create_quiz, name="create_quiz"),
    path("get-quiz/<str:quiz_code>/", get_quiz, name="get-quiz"),
    path("quizzes/", QuizListView.as_view(), name="quiz-list"),
    path('quiz/<str:quiz_code>/', TakeQuizView.as_view(), name='take_quiz'),  # New endpoint to fetch a quiz
    path("attempt-quiz/", AttemptQuizView.as_view(), name="attempt-quiz"),
    path("submit-quiz/", SubmitQuizView.as_view(), name="submit-quiz"),  # New endpoint to handle quiz submission
    path("student/<str:student_code>/profile/", get_student_profile, name="Profile"),
    path("teacher/<str:teacherCode>/profile/", get_teacher_profile, name="Profile")
]
