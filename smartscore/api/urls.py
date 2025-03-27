from django.urls import path
from .views import signup, login
from .views import BranchListView, get_leaderboard, StudentQuizListView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path("branches/", BranchListView.as_view(), name="branch-list"),
    path('leaderboard/', get_leaderboard, name='leaderboard'),
    path("student/<str:student_code>/quizzes/", StudentQuizListView.as_view(), name="student-quizzes"),
    #path("api/branches/", lambda request: JsonResponse({"message": "Test route working"})),
]
