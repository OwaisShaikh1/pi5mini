import React, { useState } from "react";

const CSVQuestionImport = ({ onImport }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      setMessage({ type: "error", text: "Please upload a CSV file." });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size exceeds 5MB limit." });
      return;
    }

    setCsvFile(file);
    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/upload-quiz-csv/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Convert backend format to frontend format
        const importedQuestions = data.questions.map((q, idx) => ({
          id: Date.now() + idx,
          text: q.text,
          type: "Multiple Choice",
          points: q.marks || 2,
          solution: q.solution || "",  // Include solution if present
          answers: q.choices.map((choice, cIdx) => ({
            id: Date.now() + idx * 100 + cIdx,
            text: choice.text,
            correct: choice.is_correct,
          })),
        }));

        // Call parent's import handler (append mode)
        onImport?.(importedQuestions, "append");

        let successMsg = `Successfully imported ${data.count} questions from CSV!`;
        if (data.skipped > 0) {
          successMsg += ` (${data.skipped} questions skipped)`;
        }
        setMessage({ type: "success", text: successMsg });
      } else {
        setMessage({ type: "error", text: data.error || 'Failed to parse CSV file.' });
      }
    } catch (error) {
      setMessage({ type: "error", text: 'Error uploading file. Please try again.' });
      console.error('CSV upload error:', error);
    } finally {
      setIsUploading(false);
      setCsvFile(null);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = `Question,Option A,Option B,Option C,Option D,Correct Answer,Marks
What is the capital of France?,Berlin,Paris,Madrid,Rome,B,2
What is 2 + 2?,3,4,5,6,B,1
# Alternative format also supported (lowercase with underscores):
# question,option_a,option_b,option_c,option_d,answer,marks`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_template.csv';
    link.click();
  };

  return (
    <div className="bulk-card">
      <div className="bulk-header">
        <div>
          <p className="eyebrow">CSV Import</p>
          <h3>📄 Import Questions from CSV</h3>
          <p className="muted">Upload a CSV file with your quiz questions.</p>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="csv-format-guide" style={{ fontSize: '12px', marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <strong>Required columns:</strong> question, option_a, option_b, answer (or Question, Option A, Option B, Correct Answer)<br/>
        <strong>Optional columns:</strong> option_c, option_d, option_e, marks, solution<br/>
        <strong>Answer format:</strong> Use A, B, C, D, or E (or 1, 2, 3, 4, 5)
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`csv-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #4CAF50' : '2px dashed #ccc',
          backgroundColor: isDragging ? '#f0f8f0' : '#fafafa',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '12px',
          transition: 'all 0.2s ease'
        }}
      >
        {isUploading ? (
          <p style={{ color: '#2196F3', fontWeight: 500 }}>⏳ Uploading and parsing CSV...</p>
        ) : (
          <>
            <p style={{ marginBottom: '12px' }}>📂 Drag and drop your CSV file here, or</p>
            <label style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </label>
          </>
        )}
      </div>

      {/* Status Messages */}
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '6px',
          backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9',
          border: `1px solid ${message.type === 'error' ? '#ef5350' : '#4CAF50'}`,
          color: message.type === 'error' ? '#c62828' : '#2e7d32'
        }}>
          {message.type === 'error' ? '❌' : '✅'} {message.text}
        </div>
      )}

      {/* Download Template Button */}
      <button
        type="button"
        onClick={downloadTemplate}
        style={{
          padding: '8px 16px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        ⬇️ Download CSV Template
      </button>
    </div>
  );
};

export default CSVQuestionImport;
