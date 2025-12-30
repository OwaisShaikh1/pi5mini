import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

const TEMPLATE_ROWS = [
  ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Option (A-D)", "Marks"],
  ["What is the capital of France?", "Berlin", "Paris", "Madrid", "Rome", "B", 2],
];

const FIELD_DEFINITIONS = [
  { key: "question", label: "Question Text", required: true },
  { key: "optionA", label: "Option A", required: true },
  { key: "optionB", label: "Option B", required: true },
  { key: "optionC", label: "Option C", required: false },
  { key: "optionD", label: "Option D", required: false },
  { key: "correct", label: "Correct Option (A/B/C/D or 1-4)", required: true },
  { key: "marks", label: "Marks", required: false },
];

const normalizeString = (value) => (typeof value === "string" ? value.trim() : value);

const parseCorrectIndex = (raw, choiceCount) => {
  if (!raw) return 0;
  const value = normalizeString(raw).toString();
  const letter = value.charAt(0).toLowerCase();
  if (/[a-z]/.test(letter)) {
    const idx = letter.charCodeAt(0) - "a".charCodeAt(0);
    return idx < choiceCount ? idx : 0;
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= choiceCount) {
    return numeric - 1;
  }
  return 0;
};

const toQuestionsWithMapping = (rows, mapping) => {
  const questions = [];
  rows.forEach((row, idx) => {
    const questionText = normalizeString(row[mapping.question]);
    const options = [
      normalizeString(row[mapping.optionA]),
      normalizeString(row[mapping.optionB]),
      mapping.optionC ? normalizeString(row[mapping.optionC]) : null,
      mapping.optionD ? normalizeString(row[mapping.optionD]) : null,
    ].filter((opt) => opt && opt.length > 0);

    if (!questionText || options.length < 2) return;

    const marks = Number(row[mapping.marks]) || 2;
    const correctIndex = parseCorrectIndex(row[mapping.correct], options.length);

    const questionId = Date.now() + idx;
    const answers = options.map((text, answerIdx) => ({
      id: `${questionId}-${answerIdx}`,
      text,
      correct: answerIdx === correctIndex,
    }));

    questions.push({
      id: questionId,
      text: questionText,
      points: marks > 0 ? marks : 1,
      answers,
    });
  });
  return questions;
};

// ─────────────────────────────────────────────────────────────────────────────
// Editable Question Card
// ─────────────────────────────────────────────────────────────────────────────
const EditableQuestionCard = ({ question, onChange, onRemove }) => {
  const updateField = (field, value) => onChange({ ...question, [field]: value });

  const updateAnswer = (answerId, text) => {
    const answers = question.answers.map((a) => (a.id === answerId ? { ...a, text } : a));
    onChange({ ...question, answers });
  };

  const setCorrect = (answerId) => {
    const answers = question.answers.map((a) => ({ ...a, correct: a.id === answerId }));
    onChange({ ...question, answers });
  };

  const addAnswer = () => {
    const newId = `${question.id}-${Date.now()}`;
    onChange({ ...question, answers: [...question.answers, { id: newId, text: "", correct: false }] });
  };

  const removeAnswer = (answerId) => {
    if (question.answers.length <= 2) return;
    let answers = question.answers.filter((a) => a.id !== answerId);
    if (!answers.some((a) => a.correct) && answers.length) answers[0].correct = true;
    onChange({ ...question, answers });
  };

  return (
    <div className="editable-question-card">
      <div className="eq-header">
        <input
          type="text"
          className="eq-question-input"
          value={question.text}
          onChange={(e) => updateField("text", e.target.value)}
          placeholder="Question text"
        />
        <input
          type="number"
          className="eq-marks-input"
          value={question.points}
          min={1}
          onChange={(e) => updateField("points", Number(e.target.value))}
        />
        <button type="button" className="mini-btn danger" onClick={onRemove}>✕</button>
      </div>
      <div className="eq-answers">
        {question.answers.map((ans, idx) => (
          <div key={ans.id} className="eq-answer-row">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={ans.correct}
              onChange={() => setCorrect(ans.id)}
              title="Mark as correct"
            />
            <span className="eq-letter">{String.fromCharCode(65 + idx)}</span>
            <input
              type="text"
              className="eq-answer-input"
              value={ans.text}
              onChange={(e) => updateAnswer(ans.id, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
            />
            {question.answers.length > 2 && (
              <button type="button" className="mini-btn" onClick={() => removeAnswer(ans.id)}>−</button>
            )}
          </div>
        ))}
        <button type="button" className="mini-btn ghost" onClick={addAnswer}>+ Add option</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Column Mapper UI
// ─────────────────────────────────────────────────────────────────────────────
const ColumnMapper = ({ columns, mapping, setMapping }) => {
  const handleChange = (fieldKey, colName) => setMapping((prev) => ({ ...prev, [fieldKey]: colName }));

  return (
    <div className="column-mapper">
      <p className="eyebrow">Map your columns</p>
      <p className="muted">Match each field to a column from your file.</p>
      <div className="mapper-grid">
        {FIELD_DEFINITIONS.map((field) => (
          <div key={field.key} className="mapper-row">
            <label>
              {field.label}
              {field.required && <span className="required-star">*</span>}
            </label>
            <select value={mapping[field.key] || ""} onChange={(e) => handleChange(field.key, e.target.value)}>
              <option value="">— Select column —</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const BulkQuestionImport = ({ onImport }) => {
  const [mode, setMode] = useState("append");
  const [status, setStatus] = useState(null);

  // Step management: upload → map → preview → confirm
  const [step, setStep] = useState("upload"); // upload | map | preview
  const [rawRows, setRawRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [parsedQuestions, setParsedQuestions] = useState([]);

  // ─── File handling ───
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        setStatus({ type: "error", message: "File appears empty." });
        return;
      }

      const cols = Object.keys(rows[0]);
      setColumns(cols);
      setRawRows(rows);

      // Auto-map columns if names are obvious
      const autoMap = {};
      cols.forEach((col) => {
        const lc = col.toLowerCase();
        if (lc.includes("question")) autoMap.question = col;
        if (lc === "option a" || lc === "optiona") autoMap.optionA = col;
        if (lc === "option b" || lc === "optionb") autoMap.optionB = col;
        if (lc === "option c" || lc === "optionc") autoMap.optionC = col;
        if (lc === "option d" || lc === "optiond") autoMap.optionD = col;
        if (lc.includes("correct")) autoMap.correct = col;
        if (lc.includes("mark") || lc.includes("point") || lc.includes("score")) autoMap.marks = col;
      });
      setMapping(autoMap);

      setStatus(null);
      setStep("map");
    } catch (err) {
      setStatus({ type: "error", message: "Could not read file. Ensure it is CSV or Excel." });
    }
  };

  // ─── Mapping validation ───
  const mappingValid = useMemo(() => {
    return mapping.question && mapping.optionA && mapping.optionB && mapping.correct;
  }, [mapping]);

  const handleApplyMapping = () => {
    if (!mappingValid) {
      setStatus({ type: "error", message: "Please map all required fields." });
      return;
    }
    const questions = toQuestionsWithMapping(rawRows, mapping);
    if (!questions.length) {
      setStatus({ type: "error", message: "No valid questions could be parsed." });
      return;
    }
    setParsedQuestions(questions);
    setStatus({ type: "success", message: `${questions.length} questions parsed. Review and edit below.` });
    setStep("preview");
  };

  // ─── Editable preview handlers ───
  const updateQuestion = (id, updated) => {
    setParsedQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const removeQuestion = (id) => {
    setParsedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleConfirmImport = () => {
    if (!parsedQuestions.length) {
      setStatus({ type: "error", message: "No questions to import." });
      return;
    }
    onImport?.(parsedQuestions, mode);
    setStatus({ type: "success", message: `${parsedQuestions.length} questions imported (${mode}).` });
    // Reset for next upload
    setStep("upload");
    setRawRows([]);
    setColumns([]);
    setMapping({});
    setParsedQuestions([]);
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(TEMPLATE_ROWS);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "smartscore-question-template.xlsx");
  };

  const handleReset = () => {
    setStep("upload");
    setRawRows([]);
    setColumns([]);
    setMapping({});
    setParsedQuestions([]);
    setStatus(null);
  };

  // ─── Render ───
  return (
    <div className="bulk-card">
      <div className="bulk-header">
        <div>
          <p className="eyebrow">Bulk add</p>
          <h3>Import questions from CSV / Excel</h3>
          <p className="muted">Upload a file, map columns, review &amp; edit, then import.</p>
        </div>
        <div className="mode-switch">
          <label>
            <input type="radio" name="import-mode" value="append" checked={mode === "append"} onChange={() => setMode("append")} />
            Append
          </label>
          <label>
            <input type="radio" name="import-mode" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} />
            Replace
          </label>
        </div>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        <span className={step === "upload" ? "active" : ""}>1. Upload</span>
        <span className={step === "map" ? "active" : ""}>2. Map columns</span>
        <span className={step === "preview" ? "active" : ""}>3. Review &amp; edit</span>
      </div>

      {status && <p className={status.type === "error" ? "error-text" : "success-text"}>{status.message}</p>}

      {/* STEP: UPLOAD */}
      {step === "upload" && (
        <div className="bulk-actions">
          <button type="button" className="cta ghost" onClick={handleDownloadTemplate}>Download template</button>
          <label className="file-input">
            <input
              type="file"
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFile}
            />
            <span>Upload CSV / Excel</span>
          </label>
        </div>
      )}

      {/* STEP: MAP */}
      {step === "map" && (
        <>
          <ColumnMapper columns={columns} mapping={mapping} setMapping={setMapping} />
          <div className="bulk-actions" style={{ marginTop: 12 }}>
            <button type="button" className="cta ghost" onClick={handleReset}>Cancel</button>
            <button type="button" className="cta primary" onClick={handleApplyMapping} disabled={!mappingValid}>
              Parse questions
            </button>
          </div>
        </>
      )}

      {/* STEP: PREVIEW (editable) */}
      {step === "preview" && (
        <>
          <div className="editable-preview-list">
            {parsedQuestions.map((q) => (
              <EditableQuestionCard
                key={q.id}
                question={q}
                onChange={(updated) => updateQuestion(q.id, updated)}
                onRemove={() => removeQuestion(q.id)}
              />
            ))}
          </div>
          <div className="bulk-actions" style={{ marginTop: 12 }}>
            <button type="button" className="cta ghost" onClick={() => setStep("map")}>Back to mapping</button>
            <button type="button" className="cta primary" onClick={handleConfirmImport}>
              Import {parsedQuestions.length} questions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkQuestionImport;
