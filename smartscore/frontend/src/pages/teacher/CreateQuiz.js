import React, { useState } from "react";
import "../../styles/css/createquiz.css";

const CreateQuiz = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [subject, setSubject] = useState("");
    const [attempts, setAttempts] = useState("Unlimited");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([]);

    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleAnswers, setShuffleAnswers] = useState(false);
    const [feedbackOptions, setFeedbackOptions] = useState(false);

    // Function to add a new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { 
                id: Date.now(), 
                text: "", 
                type: "Multiple Choice", 
                points: "", 
                answers: [{ id: 1, text: "", correct: false }] 
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
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
                : q
        ));
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

    const totalScore = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    //function to save quiz
    const saveQuiz = async () => {
        if (!quizTitle.trim()) {
            alert("Please enter a quiz title.");
            return;
        }
    
        const quizData = {
            code: "QZ" + Math.floor(1000 + Math.random() * 9000),  // Generate a random quiz code
            topic_id: "T001",  // Replace with the selected topic ID
            teachercode: localStorage.getItem("teachercode"),
            score: totalScore, // Adjust score as needed
            questions: questions.map(q => ({
                text: q.text,
                choices: q.answers.map(a => ({
                    text: a.text,
                    is_correct: a.correct
                }))
            }))
        };
    
        try {
            const response = await fetch("http://localhost:8000/api/create-quiz/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quizData)
            });
        
            const data = await response.json();
            console.log("Server Response:", data); // ✅ Log the full response
        
            if (response.ok) {
                alert("Quiz saved successfully!");
            } else {
                alert("Failed to save quiz: " + JSON.stringify(data)); // ✅ Show full error
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
            alert("Failed to save quiz.");
        }
        
    };
    

    return (
        <div className="create-quiz-container">
            {/* Header */}
            <div className="create-quiz-header">
                <h1>Add Quiz</h1>
                <button className="btn-secondary">✖</button>
            </div>

            {/* Quiz Details */}
            <div className="quiz-details">
                <h2>Details</h2>
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
                        onChange={(e) => setTimeLimit(Number(e.target.value))}  // Convert to number
                    />
                </div>
                <div className="input-group">
                    <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                        <option value="">Select Subject</option>
                        <option value="Math">Math</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
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

            {/* Questions Section */}
            <div className="questions-section">
                <h2>Questions</h2>
                {questions.map((q, index) => (
                    <div key={q.id} className="question-item">
                        <div className="question-header">
                            <span>Question {index + 1}</span>
                            <button className="btn-secondary" onClick={() => deleteQuestion(q.id)}>🗑</button>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter question text..."
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        />

                        {/* Answer options */}
                        <div className="answers-section">
                            <h4>Answers (Mark the correct one)</h4>
                            {q.answers.map((a) => (
                                <div key={a.id} className="answer-item">
                                    <input
                                        type="radio"
                                        name={`correct-answer-${q.id}`}
                                        checked={a.correct}
                                        onChange={() => markCorrectAnswer(q.id, a.id)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Answer option..."
                                        value={a.text}
                                        onChange={(e) => updateAnswerText(q.id, a.id, e.target.value)}
                                    />
                                    <button className="btn-secondary" onClick={() => removeAnswer(q.id, a.id)}>🗑</button>
                                </div>
                            ))}
                            <button className="btn-primary add-answer-btn" onClick={() => addAnswer(q.id)}>+ Add Answer</button>
                        </div>
                    </div>
                ))}
                <button className="btn-primary" onClick={addQuestion}>+ Add Question</button>
            </div>

            {/* Toggle Switches */}
            <div className="toggle-switches">
                <label>
                    <input type="checkbox" checked={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} />
                    Shuffle Questions
                </label>
                <label>
                    <input type="checkbox" checked={shuffleAnswers} onChange={() => setShuffleAnswers(!shuffleAnswers)} />
                    Shuffle Answers
                </label>
                <label>
                    <input type="checkbox" checked={feedbackOptions} onChange={() => setFeedbackOptions(!feedbackOptions)} />
                    Feedback Options
                </label>
            </div>

            {/* Buttons */}
            <div className="bottom-buttons">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-primary" onClick={saveQuiz}>Save</button>
            </div>
        </div>
    );
};

export default CreateQuiz;
