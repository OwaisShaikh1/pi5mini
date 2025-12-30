import React, { useEffect, useState } from "react";
import "../../styles/css/createquiz.css";
import BulkQuestionImport from "../../components/teacher/BulkQuestionImport";

const CreateQuiz = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [subject, setSubject] = useState(localStorage.getItem("activeSubjectCode") || "");
    const [attempts, setAttempts] = useState("Unlimited");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleAnswers, setShuffleAnswers] = useState(false);
    const [feedbackOptions, setFeedbackOptions] = useState(false);

    // Fetch subjects from backend
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/subjects/");
                const data = await response.json();
                setSubjects(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };

        fetchSubjects();
    }, []);

    // Function to add a new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { 
                id: Date.now(), 
                text: "", 
                type: "Multiple Choice", 
                points: 2, 
                answers: [{ id: 1, text: "", correct: true }, { id: 2, text: "", correct: false }] 
            }
        ]);
    };

    // Function to update question text
    const updateQuestion = (id, updates) => {
        setQuestions(prevQuestions => 
            prevQuestions.map((q) => q.id === id ? { ...q, ...updates } : q)
        );
    };

    // Function to delete a question
    const deleteQuestion = (id) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    // Function to add an answer option to a question
    const addAnswer = (questionId) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, answers: [...q.answers, { id: Date.now(), text: "", correct: false }] }
                : q
        ));
    };

    // Function to remove an answer option
    const removeAnswer = (questionId, answerId) => {
        setQuestions(questions.map(q => {
            if (q.id !== questionId) return q;
            if (q.answers.length <= 2) return q; // Keep at least two options
            const updated = q.answers.filter(a => a.id !== answerId);
            const hasCorrect = updated.some((a) => a.correct);
            if (!hasCorrect && updated.length) {
                updated[0] = { ...updated[0], correct: true };
            }
            return { ...q, answers: updated };
        }));
    };

    // Function to update an answer text
    const updateAnswerText = (questionId, answerId, text) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { 
                    ...q, 
                    answers: q.answers.map(a => a.id === answerId ? { ...a, text } : a) 
                }
                : q
        ));
    };

    // Function to mark an answer as correct
    const markCorrectAnswer = (questionId, answerId) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { 
                    ...q, 
                    answers: q.answers.map(a => ({
                        ...a, 
                        correct: a.id === answerId
                    }))
                }
                : q
        ));
    };

    // Calculate total score
    const totalScore = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const handleBulkImport = (importedQuestions, mode) => {
        setQuestions((prev) => (mode === "replace" ? importedQuestions : [...prev, ...importedQuestions]));
    };

    // Function to save quiz
    const saveQuiz = async () => {
        setSaveError("");

        if (!quizTitle.trim()) {
            setSaveError("Please enter a quiz title.");
            return;
        }
        if (!subject) {
            setSaveError("Please select a subject.");
            return;
        }
        if (!questions.length) {
            setSaveError("Add at least one question before saving.");
            return;
        }

        const hasIncompleteQuestion = questions.some((q) => !q.text.trim() || q.answers.length < 2 || q.answers.some((a) => !a.text.trim()));
        if (hasIncompleteQuestion) {
            setSaveError("Please complete all questions and answers (minimum two options each).");
            return;
        }

        const hasMissingCorrect = questions.some((q) => !q.answers.some((a) => a.correct));
        if (hasMissingCorrect) {
            setSaveError("Mark one correct answer for every question.");
            return;
        }
    
        const quizData = {
            code: quizTitle,
            subject_id: subject,
            teachercode: localStorage.getItem("teachercode"),
            score: totalScore,
            time_limit: timeLimit || 30,
            questions: questions.map(q => ({
                text: q.text,
                marks: q.points && q.points > 0 ? q.points : 2,
                choices: q.answers.map(a => ({
                    text: a.text,
                    is_correct: a.correct
                }))
            }))
        };
    
        try {
            setIsSaving(true);
            const response = await fetch("http://localhost:8000/api/create-quiz/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quizData)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Quiz saved successfully!");
            } else {
                setSaveError(data?.error || "Failed to save quiz. Please review your data.");
            }
        } catch (error) {
            setSaveError("Failed to save quiz. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Progress calculation
    const completedQuestions = questions.filter(q => q.text.trim() && q.answers.every(a => a.text.trim())).length;
    const progress = questions.length > 0 ? Math.round((completedQuestions / questions.length) * 100) : 0;

    return (
        <div className="create-quiz-container">
            <div className="create-quiz-header">
                <div>
                    <p className="eyebrow">Teacher workspace</p>
                    <h1>🎓 Create New Quiz</h1>
                    <p className="muted">Build engaging quizzes for your students. Add questions manually or import in bulk.</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-icon">📝</span>
                        <div>
                            <p className="stat-value">{questions.length}</p>
                            <p className="stat-label">Questions</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">⭐</span>
                        <div>
                            <p className="stat-value">{totalScore}</p>
                            <p className="stat-label">Total Marks</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">⏱️</span>
                        <div>
                            <p className="stat-value">{timeLimit || 30}</p>
                            <p className="stat-label">Minutes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {questions.length > 0 && (
                <div className="quiz-progress">
                    <div className="progress-header">
                        <span>Quiz Completion</span>
                        <span className="progress-percent">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="progress-hint">{completedQuestions} of {questions.length} questions complete</p>
                </div>
            )}

            <div className="import-row">
                <BulkQuestionImport onImport={handleBulkImport} />
                <div className="glance-card">
                    <p className="eyebrow">📋 Quick Overview</p>
                    <ul>
                        <li><span>📚 Subject</span><span className={subject ? "" : "not-set"}>{subject || "Not selected"}</span></li>
                        <li><span>⏰ Duration</span><span>{timeLimit || 30} mins</span></li>
                        <li><span>🔄 Attempts</span><span>{attempts}</span></li>
                        <li><span>📅 Due Date</span><span className={dueDate ? "" : "not-set"}>{dueDate || "Not set"}</span></li>
                    </ul>
                </div>
            </div>

            <div className="quiz-details">
                <h2>📝 Quiz Details</h2>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Quiz Title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                    />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Time Limit (minutes)"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                    />
                </div>
                <div className="input-group">
                    <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                        <option value="">Select Subject</option>
                        {subjects.map(sub => (
                            <option key={sub.code} value={sub.code}>{sub.name}</option>
                        ))}
                    </select>
                    <select value={attempts} onChange={(e) => setAttempts(e.target.value)}>
                        <option value="Unlimited">Unlimited</option>
                        <option value="1">1 Attempt</option>
                        <option value="3">3 Attempts</option>
                    </select>
                </div>
                <textarea
                    rows="3"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="questions-section">
                <div className="section-header">
                    <h2>❓ Questions</h2>
                    <span className="question-count-badge">{questions.length} total</span>
                </div>
                
                {questions.length === 0 && (
                    <div className="empty-questions">
                        <span className="empty-icon">📋</span>
                        <h3>No questions yet</h3>
                        <p>Start by adding your first question or import questions in bulk above.</p>
                    </div>
                )}

                {questions.map((q, index) => {
                    const isComplete = q.text.trim() && q.answers.length >= 2 && q.answers.every(a => a.text.trim()) && q.answers.some(a => a.correct);
                    return (
                        <div key={q.id} className={`question-item ${isComplete ? 'complete' : 'incomplete'}`}>
                            <div className="question-header">
                                <div className="question-number">
                                    <span className="q-num">{index + 1}</span>
                                    {isComplete ? <span className="status-dot complete">✓</span> : <span className="status-dot incomplete">!</span>}
                                </div>
                                <div className="question-meta">
                                    <span className="points-badge">⭐ {q.points} pts</span>
                                    <span className="answers-badge">📝 {q.answers.length} options</span>
                                </div>
                                <button className="btn-delete" onClick={() => deleteQuestion(q.id)} title="Delete question">🗑️</button>
                            </div>
                            <textarea
                                className="question-input"
                                placeholder="Type your question here..."
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                rows={2}
                            />
                            <div className="points-group">
                                <label className="points-label">⭐ Points for this question</label>
                                <input
                                    type="number"
                                    placeholder="2"
                                    value={q.points}
                                    min={1}
                                    onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                                    onBlur={(e) => {
                                        if (e.target.value === "" || Number(e.target.value) <= 0) {
                                            updateQuestion(q.id, { points: 1 });
                                        }
                                    }}
                                />
                            </div>

                            <div className="answers-section">
                                <h4>🎯 Answer Options <span className="hint">(Select the correct answer)</span></h4>
                                {q.answers.map((a, aIndex) => (
                                    <div key={a.id} className={`answer-item ${a.correct ? 'correct-answer' : ''}`}>
                                        <span className="answer-letter">{String.fromCharCode(65 + aIndex)}</span>
                                        <input
                                            type="radio"
                                            name={`correct-answer-${q.id}`}
                                            checked={a.correct}
                                            onChange={() => markCorrectAnswer(q.id, a.id)}
                                            title="Mark as correct"
                                        />
                                        <input
                                            type="text"
                                            placeholder={`Option ${String.fromCharCode(65 + aIndex)}...`}
                                            value={a.text}
                                            onChange={(e) => updateAnswerText(q.id, a.id, e.target.value)}
                                        />
                                        {a.correct && <span className="correct-tag">✓ Correct</span>}
                                        {q.answers.length > 2 && (
                                            <button className="btn-remove-answer" onClick={() => removeAnswer(q.id, a.id)} title="Remove option">×</button>
                                        )}
                                    </div>
                                ))}
                                <button className="btn-add-answer" onClick={() => addAnswer(q.id)}>+ Add another option</button>
                            </div>
                        </div>
                    );
                })}
                <button className="btn-add-question" onClick={addQuestion}>
                    <span className="btn-icon">➕</span> Add New Question
                </button>
            </div>

            <div className="quiz-summary-card">
                <h3>📊 Quiz Summary</h3>
                <div className="summary-stats">
                    <div className="summary-item">
                        <span className="value">{questions.length}</span>
                        <span className="label">Questions</span>
                    </div>
                    <div className="summary-item">
                        <span className="value">{totalScore}</span>
                        <span className="label">Total Marks</span>
                    </div>
                    <div className="summary-item">
                        <span className="value">{timeLimit || 30}</span>
                        <span className="label">Minutes</span>
                    </div>
                    <div className="summary-item">
                        <span className="value">{completedQuestions}</span>
                        <span className="label">Complete</span>
                    </div>
                </div>
            </div>

            <div className="quiz-options">
                <h3>⚙️ Quiz Settings</h3>
                <label className="toggle-label">
                    <span className="toggle-text">
                        <span className="toggle-icon">🔀</span>
                        Shuffle Questions
                    </span>
                    <input type="checkbox" checked={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} />
                </label>
                <label className="toggle-label">
                    <span className="toggle-text">
                        <span className="toggle-icon">🎲</span>
                        Shuffle Answers
                    </span>
                    <input type="checkbox" checked={shuffleAnswers} onChange={() => setShuffleAnswers(!shuffleAnswers)} />
                </label>
                <label className="toggle-label">
                    <span className="toggle-text">
                        <span className="toggle-icon">💬</span>
                        Show Feedback After Submission
                    </span>
                    <input type="checkbox" checked={feedbackOptions} onChange={() => setFeedbackOptions(!feedbackOptions)} />
                </label>
            </div>

            {saveError && (
                <div className="error-banner">
                    <span>⚠️</span>
                    <p>{saveError}</p>
                </div>
            )}

            <div className="quiz-actions">
                <button className="btn-cancel" onClick={() => window.history.back()}>
                    ← Cancel
                </button>
                <button className="btn-save" onClick={saveQuiz} disabled={isSaving}>
                    {isSaving ? "⏳ Saving..." : "💾 Save Quiz"}
                </button>
            </div>
        </div>
    );
};

export default CreateQuiz;
