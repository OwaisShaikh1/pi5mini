import { useState } from "react";
import QuizSettings from "./QuizSettings";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

export default function QuizCreator() {
  const [questions, setQuestions] = useState([]);
  const [quizSettings, setQuizSettings] = useState({ title: "", duration: 30 });
  const [csvFile, setCsvFile] = useState(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileUpload(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Upload CSV to backend
  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a CSV file.');
      setCsvSuccess(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCsvError('File size exceeds 5MB limit.');
      setCsvSuccess(null);
      return;
    }

    setCsvFile(file);
    setIsUploadingCSV(true);
    setCsvError(null);
    setCsvSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-quiz-csv/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Convert backend format to frontend format
        const importedQuestions = data.questions.map((q, idx) => ({
          id: Date.now() + idx,
          text: q.text,
          points: q.marks || 2,
          answers: q.choices.map((choice, cIdx) => ({
            id: `${Date.now() + idx}-${cIdx}`,
            text: choice.text,
            correct: choice.is_correct,
          })),
        }));

        // Add imported questions to the list
        setQuestions([...questions, ...importedQuestions]);
        setCsvSuccess(`Successfully imported ${data.count} questions from CSV!`);
        if (data.skipped > 0) {
          setCsvSuccess(prev => `${prev} (${data.skipped} questions skipped)`);
        }
      } else {
        setCsvError(data.error || 'Failed to parse CSV file.');
      }
    } catch (error) {
      setCsvError('Error uploading file. Please try again.');
      console.error('CSV upload error:', error);
    } finally {
      setIsUploadingCSV(false);
      // Reset file input
      setCsvFile(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create a Quiz</h1>
      
      <QuizSettings settings={quizSettings} setSettings={setQuizSettings} />
      
      {/* CSV Upload Section */}
      <div className="mb-6 p-4 border-2 border-dashed rounded-lg">
        <h3 className="font-semibold mb-2">📄 Import Questions from CSV</h3>
        <p className="text-sm text-gray-600 mb-3">
          Upload a CSV file with columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks
        </p>
        
        <div
          className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploadingCSV ? (
            <p className="text-blue-600">Uploading and parsing CSV...</p>
          ) : (
            <>
              <p className="mb-2">Drag and drop your CSV file here, or</p>
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {csvError && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            ❌ {csvError}
          </div>
        )}

        {csvSuccess && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            ✅ {csvSuccess}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          <p>💡 <strong>Tip:</strong> Correct Answer should be A, B, C, D (or 1, 2, 3, 4)</p>
        </div>
      </div>

      {/* Manual Question Entry */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">✏️ Or Add Questions Manually</h3>
        <QuestionForm addQuestion={addQuestion} />
      </div>

      {/* Question List */}
      <QuestionList questions={questions} onRemove={removeQuestion} />
    </div>
  );
}
