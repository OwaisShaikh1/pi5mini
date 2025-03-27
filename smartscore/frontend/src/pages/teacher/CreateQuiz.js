import React, { useState } from "react";

const CreateQuiz = () => {
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    subject: "",
    dueDate: "",
    timeLimit: 30,
    description: "",
    numberOfAttempts: "Unlimited",
  });

  const [questions, setQuestions] = useState([
    { id: 1, text: "", type: "Multiple Choice", answers: ["", ""], correctAnswer: null },
  ]);

  const handleQuizDetailChange = (e) => {
    setQuizDetails({ ...quizDetails, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: "", type: "Multiple Choice", answers: ["", ""], correctAnswer: null },
    ]);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleAddAnswer = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answers.push("");
    setQuestions(updatedQuestions);
  };

  const handleRemoveAnswer = (qIndex, aIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers.splice(aIndex, 1);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Add Quiz</h1>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Detail</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Quiz Title"
            name="title"
            value={quizDetails.title}
            onChange={handleQuizDetailChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="dueDate"
            value={quizDetails.dueDate}
            onChange={handleQuizDetailChange}
            className="p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <select
            name="subject"
            value={quizDetails.subject}
            onChange={handleQuizDetailChange}
            className="p-2 border rounded"
          >
            <option value="">Select Subject</option>
            <option value="Marketing">Marketing</option>
            <option value="Business">Business</option>
          </select>
          <input
            type="number"
            name="timeLimit"
            value={quizDetails.timeLimit}
            onChange={handleQuizDetailChange}
            className="p-2 border rounded"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={quizDetails.description}
          onChange={handleQuizDetailChange}
          className="w-full p-2 mt-2 border rounded"
          rows="3"
        ></textarea>

        <select
          name="numberOfAttempts"
          value={quizDetails.numberOfAttempts}
          onChange={handleQuizDetailChange}
          className="w-full p-2 mt-2 border rounded"
        >
          <option value="Unlimited">Unlimited</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Questions</h2>
        {questions.map((question, qIndex) => (
          <div key={question.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Question {qIndex + 1}</span>
              <button
                onClick={() => handleDeleteQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter question text"
              value={question.text}
              onChange={(e) => {
                const updatedQuestions = [...questions];
                updatedQuestions[qIndex].text = e.target.value;
                setQuestions(updatedQuestions);
              }}
              className="w-full p-2 mt-2 border rounded"
            />

            <select
              value={question.type}
              onChange={(e) => {
                const updatedQuestions = [...questions];
                updatedQuestions[qIndex].type = e.target.value;
                setQuestions(updatedQuestions);
              }}
              className="w-full p-2 mt-2 border rounded"
            >
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True/False">True/False</option>
            </select>

            <div className="mt-2">
              <h3 className="text-sm text-gray-500">Answers</h3>
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} className="flex items-center gap-2 mt-1">
                  <input
                    type="radio"
                    name={`correctAnswer-${qIndex}`}
                    checked={question.correctAnswer === aIndex}
                    onChange={() => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].correctAnswer = aIndex;
                      setQuestions(updatedQuestions);
                    }}
                  />
                  <input
                    type="text"
                    placeholder={`Answer ${aIndex + 1}`}
                    value={answer}
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].answers[aIndex] = e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                    className="p-2 border rounded flex-1"
                  />
                  {question.answers.length > 2 && (
                    <button onClick={() => handleRemoveAnswer(qIndex, aIndex)} className="text-red-500">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => handleAddAnswer(qIndex)}
                className="text-blue-500 mt-2"
              >
                + Add Answer
              </button>
            </div>
          </div>
        ))}

        <button onClick={handleAddQuestion} className="bg-blue-500 text-white px-4 py-2 rounded">
          + Add Question
        </button>
      </div>

      <div className="flex justify-between">
        <button className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
};

export default CreateQuiz;
