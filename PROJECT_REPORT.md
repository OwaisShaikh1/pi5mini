# SmartScore - Comprehensive Project Report

## Project Overview

**SmartScore** is a comprehensive quiz management and assessment platform designed for educational institutions. It's a full-stack web application that facilitates online quiz creation, administration, and performance tracking for both teachers and students.

### Technology Stack

**Backend:**
- **Framework:** Django 
- **API:** Django REST Framework
- **Authentication:** JWT (JSON Web Tokens) using `rest_framework_simplejwt`
- **Database:** Configurable (PostgreSQL/MySQL/SQLite via environment variables)
- **Email Service:** SMTP (Gmail configured)

**Frontend:**
- **Framework:** React 19.0.0
- **Routing:** React Router DOM v7.1.5
- **Build Tool:** Webpack 5.98.0
- **UI Libraries:** 
  - Material-UI (@mui/material & @mui/icons-material)
  - Lucide React (icons)
  - Recharts (data visualization)
  - ShadCN UI components
- **HTTP Client:** Axios 1.8.3

### Architecture
The application follows a typical Django + React architecture:
- **Backend:** REST API built with Django, serving at `http://localhost:8000`
- **Frontend:** React SPA communicating with backend via Axios
- **Authentication:** JWT tokens stored in localStorage
- **CORS:** Configured for cross-origin requests between frontend and backend

---

## Database Schema

### User Models (Custom User Management)

#### 1. **BaseUser** (Abstract Base Model)
- `code` (CharField, Primary Key) - Unique identifier
- `name` (CharField) - User's full name
- `password` (CharField) - Hashed password
- `is_active` (Boolean)
- `is_staff` (Boolean)

#### 2. **Admin** (extends BaseUser)
- `role` (default: "Admin")
- `is_staff` (True)
- `is_superuser` (True)

#### 3. **Teacher** (extends BaseUser)
- `subject` (CharField)
- `email` (EmailField)
- `is_staff` (True)

#### 4. **Student** (extends BaseUser)
- `branch` (ForeignKey to Branch)
- `average_score` (FloatField)
- `email` (EmailField)

### Academic Structure Models

#### 5. **Branch**
- `name` (CharField, Primary Key) - e.g., "COMPS", "IT"

#### 6. **Subject**
- `code` (CharField, Primary Key)
- `name` (CharField)
- `branch` (ForeignKey to Branch)

#### 7. **Topic**
- `code` (CharField, Primary Key)
- `name` (CharField)
- `subject` (ForeignKey to Subject)
- `weight` (FloatField) - Topic weight in grading

### Quiz & Assessment Models

#### 8. **Quiz**
- `code` (CharField, Primary Key)
- `subject` (ForeignKey to Subject)
- `teacher` (ForeignKey to Teacher)
- `score` (IntegerField) - Total marks
- `date_created` (DateTimeField)
- `time_limit` (IntegerField) - Duration in minutes

#### 9. **Question**
- `quiz` (ForeignKey to Quiz)
- `text` (TextField)
- `marks` (IntegerField, default: 2)

#### 10. **Choice**
- `question` (ForeignKey to Question)
- `text` (CharField)
- `is_correct` (BooleanField)

#### 11. **StudentQuiz** (Quiz Attempt Records)
- `student` (ForeignKey to Student)
- `quiz` (ForeignKey to Quiz)
- `score` (IntegerField)
- `submitted` (BooleanField)
- `attempt_time` (DateTimeField)

---

## API Endpoints

### Authentication Endpoints
- `POST /api/signup/` - User registration (student/teacher)
- `POST /api/login/` - User login (returns JWT tokens)
- `POST /api/forgot/` - Forgot password (sends temporary password via email)
- `POST /api/changepassword/` - Change user password (authenticated)

### Branch & Subject Endpoints
- `GET /api/branches/` - List all branches
- `GET /api/subjects/` - List all subjects
- `GET /api/getsubjects/?type=<student|teacher>` - Get subjects filtered by user type and branch

### Quiz Management Endpoints
- `POST /api/create-quiz/` - Create new quiz (teacher only)
- `GET /api/quizzes/` - List all available quizzes
- `GET /api/get-quiz/<quiz_code>/` - Get specific quiz details
- `GET /api/quiz/<quiz_code>/` - Get quiz for attempting (includes questions & choices)

### Quiz Attempt Endpoints
- `POST /api/attempt-quiz/` - Start/resume quiz attempt (authenticated)
- `POST /api/submit-quiz/` - Submit quiz answers and get results (authenticated)

### Student Progress Endpoints
- `GET /api/student/<student_code>/quizzes/` - Get student's quiz history (authenticated)
- `GET /api/student/<student_code>/profile/` - Get student profile (authenticated)
- `GET /api/leaderboard/` - Get leaderboard (all students sorted by score)

### Teacher Endpoints
- `GET /api/teacher/<teachercode>/profile/` - Get teacher profile with subjects (authenticated)
- `GET /api/quizhistory/` - Get all quiz attempts (teacher view)

---

## Teacher Functionalities

### 1. **Authentication & Profile Management**
- **Sign Up:** Teachers can register with code, name, password, and email
- **Login:** JWT-based authentication
- **Profile View:** 
  - View personal information (name, email, subjects)
  - Access staff status
  - Password reset functionality

### 2. **Quiz Creation**
#### Manual Quiz Creation
- **Quiz Settings:**
  - Quiz title/code
  - Subject selection (from assigned subjects)
  - Time limit configuration
  - Due date setting
  - Total score calculation (auto-computed from question marks)
  
- **Question Management:**
  - Add/delete multiple-choice questions
  - Set question text and marks per question
  - Add/remove answer choices (minimum 2)
  - Mark correct answer for each question
  - Reorder questions
  
- **Question Features:**
  - Each question supports:
    - Custom marks (default: 2)
    - Multiple choice options
    - One correct answer per question
  
#### Bulk Question Import
- Import questions from external sources
- Replace or append mode
- Batch question processing

### 3. **Quiz Management**
- **View All Quizzes:** See created quizzes with details
- **Edit Quizzes:** Modify quiz settings and questions
- **Preview Quizzes:** Review quiz before publishing
- **Delete Quizzes:** Remove outdated assessments

### 4. **Dashboard Features**
- **Statistics Overview:**
  - Completed tests count
  - Incomplete tests count
  - Overdue tests count
  - Total tests count

- **Performance Analytics:**
  - Student growth visualization (line graph)
  - Subject-wise filtering
  - Historical performance tracking

- **Leaderboard Access:**
  - View top-performing students
  - Subject-wise filtering
  - Sort by highest scores

### 5. **Course Management**
- **My Courses View:**
  - View all assigned subjects
  - Filter by branch
  - Search subjects by name/code
  - Quick navigation to create quiz for specific subject

### 6. **Student Monitoring**
- **View Student Attempts:**
  - See all quiz submissions
  - Track student performance
  - Subject-wise analysis

- **Quiz Results Analysis:**
  - View detailed quiz results
  - Track correct/incorrect answers
  - Calculate percentage scores

---

## Student Functionalities

### 1. **Authentication & Profile Management**
- **Sign Up:** 
  - Register with code, name, password, email
  - Branch selection required
- **Login:** JWT-based authentication
- **Profile View:**
  - Personal information
  - Branch/department
  - Average score across all quizzes
  - Email address

### 2. **Dashboard Features**
- **Statistics Cards:**
  - Completed tests
  - Incomplete tests
  - Overdue tests
  - Total tests attempted

- **Performance Graph:**
  - Visual representation of quiz scores over time
  - Subject-wise filtering
  - Test-by-test progress tracking
  - Percentage-based scoring

### 3. **Quiz Discovery & Access**
- **Browse Available Quizzes:**
  - View all published quizzes
  - Filter by subject
  - See quiz details:
    - Quiz title/code
    - Subject
    - Total score
    - Time limit
  - Sort by most recent

- **Attempt Quiz Button:**
  - One-click quiz start
  - Automatic attempt tracking
  - Resume incomplete attempts

### 4. **Quiz Taking Experience**
#### Interactive Quiz Interface
- **Header Information:**
  - Quiz title
  - Real-time countdown timer
  - Timer status indicators (normal/warning/critical)

- **Progress Tracking:**
  - Current question number
  - Total questions count
  - Answered questions count
  - Progress bar visualization

- **Question Display:**
  - Question text
  - Points available per question
  - Multiple-choice options (A, B, C, D)
  - Visual selection feedback

- **Navigation:**
  - Previous/Next buttons
  - Question grid navigator (sidebar)
  - Click any question to jump
  - Visual indicators:
    - Answered (green checkmark)
    - Unanswered (empty)
    - Current (highlighted)

#### Quiz Controls
- **Auto-Submit:** When time expires
- **Manual Submit:** Submit button on last question
- **Confirmation Dialog:**
  - Shows answered/unanswered count
  - Displays time remaining
  - Warns about unanswered questions

### 5. **Results & Analysis**
#### Immediate Results
- **Score Summary:**
  - Total score obtained
  - Maximum marks
  - Percentage score
  - Correct answers count
  - Total questions count

- **Detailed Question Review:**
  - View all questions with answers
  - See correct answers
  - Identify mistakes
  - Understand scoring per question

### 6. **Quiz History**
- **My Quizzes Section:**
  - View all attempted quizzes
  - Subject-wise filtering
  - Display information:
    - Quiz code
    - Topic/title
    - Subject
    - Score obtained
    - Percentage achieved
  - Sorted by most recent

### 7. **Course Management**
- **My Courses:**
  - View enrolled subjects
  - Filter by branch
  - Search subjects
  - Quick access to subject quizzes
  - Subject code and name display

### 8. **Leaderboard**
- **Competitive Features:**
  - View ranking among peers
  - Subject-wise leaderboard
  - Filter by subject dropdown
  - See top performers
  - Compare performance with others

### 9. **Notifications & Settings**
- Profile customization
- Export test data
- Plugin integration (coming soon)
- Save test history
- Password change
- Account deletion option

---

## Key Features & Functionalities

### Authentication System
- **JWT-Based Security:**
  - Access tokens for API requests
  - Refresh tokens for session management
  - Token stored in localStorage
  - Automatic token injection in requests

- **Password Management:**
  - Hashed password storage (PBKDF2)
  - Forgot password with email recovery
  - Temporary password generation
  - Password change functionality

### Real-Time Features
- **Timer Management:**
  - Countdown timer during quiz
  - Auto-submit on timeout
  - Visual warning system (color-coded)
  - Time remaining alerts

### Data Visualization
- **Performance Graphs:**
  - Line charts showing progress
  - Subject-wise filtering
  - Test-by-test tracking
  - Percentage-based scoring
  - Built with Recharts library

### User Experience
- **Responsive Design:**
  - Mobile-friendly interface
  - Adaptive layouts
  - Touch-friendly controls

- **Interactive Elements:**
  - Instant feedback on selections
  - Progress indicators
  - Loading states
  - Error handling with user-friendly messages

### Data Management
- **Efficient Querying:**
  - Related data prefetching
  - Optimized database queries
  - Serialized API responses

- **Filtering & Sorting:**
  - Subject-based filters
  - Branch-based filters
  - Search functionality
  - Sort by date/score

---

## Workflow Examples

### Teacher Workflow: Creating a Quiz
1. Login to teacher account
2. Navigate to "Create Test" from sidebar
3. Fill quiz settings:
   - Enter quiz title
   - Select subject
   - Set time limit
   - Set due date (optional)
4. Add questions:
   - Click "Add Question"
   - Enter question text
   - Set marks for question
   - Add answer choices
   - Mark correct answer
5. Review total score (auto-calculated)
6. Save quiz
7. Quiz becomes available to students

### Student Workflow: Taking a Quiz
1. Login to student account
2. Navigate to "Quizzes" section
3. Browse available quizzes
4. Click "Attempt Quiz" on desired quiz
5. Quiz interface loads with:
   - Timer starts automatically
   - First question displayed
6. Answer questions:
   - Select answer choice
   - Navigate using Previous/Next
   - Or jump to any question via sidebar grid
7. Review answers before submission
8. Click "Submit Quiz"
9. Confirm submission in dialog
10. View immediate results:
    - Total score
    - Percentage
    - Correct/incorrect breakdown
11. Review detailed solution with correct answers

### Student Workflow: Tracking Progress
1. Navigate to Dashboard
2. View statistics cards (completed/incomplete tests)
3. Check performance graph
4. Filter by subject to see subject-specific progress
5. Navigate to "History" for detailed quiz records
6. Access "Leaderboard" to compare with peers

---

## Security Features

1. **Authentication:**
   - JWT tokens with expiration
   - Secure password hashing (PBKDF2)
   - Protected routes requiring authentication

2. **Authorization:**
   - Role-based access (teacher vs student)
   - Permission checks on API endpoints
   - User-specific data filtering

3. **Data Protection:**
   - CORS configuration
   - CSRF protection (Django middleware)
   - Environment-based secrets (.env file)
   - Email credentials in environment variables

4. **Password Security:**
   - Automatic password hashing on save
   - No plain-text password storage
   - Temporary password generation for recovery
   - Email-based password reset

---

## Email Integration

The system includes email functionality for:
- **Password Recovery:**
  - Sends temporary password to registered email
  - Uses Gmail SMTP configuration
  - Configurable via environment variables

- **Configuration:**
  - Email backend: SMTP
  - Host: Gmail (smtp.gmail.com)
  - Port: 587 (TLS)
  - Credentials stored in `.env` file

---

## Frontend Components Structure

### Pages
- `AuthPage.js` - Login/Signup forms
- `Dashboard.js` - Student dashboard
- `TeacherDashboard.js` - Teacher dashboard
- `TestPage.js` - Quiz taking interface
- `ResultPage.js` - Quiz results display
- `Homepage.js` - Landing page
- `CreateQuiz.js` - Quiz creation interface
- `EditQuiz.js` - Quiz editing
- `ManageQuestions.js` - Question management
- `PreviewQuiz.js` - Quiz preview before publishing
- `NotFoundPage.js` - 404 error page

### Components
- `Auth.js` - Authentication logic
- `Profile.js` - User profile display
- `Sidebar.js` - Navigation sidebar
- `StudentQuizzes.js` - Available quizzes list
- `TakeQuiz.js` - Quiz taking component
- `MyQuiz.js` - Quiz history
- `MyCourses.js` - Course listing
- `Leaderboard.js` - Student rankings
- `Graph.js` - Performance visualization
- `QuizCreator.js` - Quiz creation form
- `QuestionForm.js` - Individual question editor
- `QuestionList.js` - Questions display
- `BulkQuestionImport.js` - Bulk import interface

### UI Components (Reusable)
- `button.js`
- `input.js`
- `select.js`
- `checkbox.js`
- `radio-group.js`
- `switch.js`
- `textarea.js`
- `label.js`
- `Modal.js`
- `AlertDialog.js`

---

## Backend API Serializers

1. **StudentSerializer** - Serializes student data with branch name
2. **TeacherSerializer** - Serializes teacher data
3. **BranchSerializer** - Branch information
4. **SubjectSerializer** - Subject details
5. **QuizSerializer** - Quiz data with subject and teacher info
6. **StudentQuizSerializer** - Quiz attempt records with calculated percentages
7. **LeaderboardSerializer** - Student rankings data
8. **QuestionSerializer** - Question details
9. **ChoiceSerializer** - Answer choices

---

## Notable Features & Implementation Details

### 1. Dynamic Score Calculation
- Quiz total score auto-calculated from question marks
- Percentage scores computed dynamically
- Average student score tracked across all quizzes

### 2. Quiz Attempt Management
- Tracks incomplete attempts
- Allows resume of unsubmitted quizzes
- Prevents duplicate active attempts
- Records attempt timestamp

### 3. Flexible Subject Management
- Students see subjects based on their branch
- Teachers can access all subjects
- Subject-based filtering throughout the app

### 4. Performance Analytics
- Real-time graph updates
- Historical data tracking
- Subject-wise analysis
- Percentage-based metrics

### 5. User-Friendly Interface
- Modern, clean design
- Intuitive navigation
- Contextual help (tips and hints)
- Emoji-enhanced UI elements
- Color-coded status indicators

### 6. Responsive Feedback
- Loading states for async operations
- Error messages with clear instructions
- Success confirmations
- Real-time validation

---

## Development Setup Requirements

### Backend Dependencies
- Django
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- python-dotenv
- Database driver (psycopg2 for PostgreSQL or mysqlclient for MySQL)

### Frontend Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.5",
  "axios": "^1.8.3",
  "recharts": "^2.15.2",
  "lucide-react": "^0.484.0",
  "@mui/material": "^6.4.4",
  "@mui/icons-material": "^6.4.4"
}
```

### Environment Variables Required
```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

---

## Future Enhancements (Based on Code Comments)

1. **AI-Powered Quiz Generation** - "Generate with AI" feature mentioned in teacher dashboard
2. **Plugin System** - Plugin options visible in profile sidebar
3. **Advanced Settings** - Settings section currently shows "coming soon"
4. **Notification System** - Notification badge present (currently showing placeholder count)
5. **Data Export** - Export functionality mentioned but not fully implemented
6. **Account Management** - Delete account option present
7. **Advanced Question Types** - Currently supports only MCQs, expandable to other types
8. **Quiz Scheduling** - Due dates configured but enforcement not visible
9. **Attempt Limits** - Attempts setting present but not enforced
10. **Feedback Options** - Toggle present in quiz settings but functionality not implemented

---

## Summary

SmartScore is a well-architected, modern quiz management platform that successfully bridges the gap between teachers and students in online assessment. The application demonstrates:

- **Clean Architecture:** Separation of concerns between frontend and backend
- **Scalability:** Modular component structure and reusable API design
- **User Experience:** Intuitive interfaces for both teacher and student roles
- **Security:** Proper authentication and authorization mechanisms
- **Performance:** Optimized queries and efficient data handling
- **Maintainability:** Well-organized code structure with clear separation of models, views, and components

The platform provides comprehensive functionality for:
- **Teachers:** Quiz creation, management, student monitoring, and analytics
- **Students:** Quiz discovery, attempt, progress tracking, and competitive leaderboards

With features like real-time timers, instant results, performance analytics, and responsive design, SmartScore offers a complete solution for online assessment management in educational institutions.

---

**Report Generated:** January 6, 2026  
**Project Status:** Active Development  
**Primary Use Case:** Educational Quiz & Assessment Management
