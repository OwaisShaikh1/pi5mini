from django.shortcuts import redirect

def index(request):
    return redirect("http://localhost:3000")  # Redirect to React's dev server
