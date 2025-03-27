export default function QuestionPreview({ question }) {
    return (
      <div className="p-3 border mb-2 rounded">
        <p className="font-semibold">{question.questionText}</p>
        <ul className="list-disc pl-4">
          {question.options.map((opt, index) => (
            <li key={index} className={index === question.correctIndex ? "font-bold" : ""}>
              {opt}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  