'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import QuestionForm from '@/components/admin/QuestionForm';
import Loading from '@/components/ui/Loading';

interface Question {
    _id: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: string;
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // JSON Import states
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/admin/questions');
            const data = await response.json();

            if (response.ok) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (formData: Omit<Question, '_id' | 'createdAt'>) => {
        const response = await fetch('/api/admin/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to add question');
        }

        await fetchQuestions();
        setModalOpen(false);
    };

    const handleEditQuestion = async (formData: Omit<Question, '_id' | 'createdAt'>) => {
        if (!editingQuestion) return;

        const response = await fetch(`/api/admin/questions/${editingQuestion._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update question');
        }

        await fetchQuestions();
        setEditingQuestion(null);
        setModalOpen(false);
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/questions/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
        setDeleteConfirm(null);
    };

    const openEditModal = (question: Question) => {
        setEditingQuestion(question);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingQuestion(null);
    };

    // Handle JSON import
    const handleImport = async () => {
        if (!jsonInput.trim()) {
            setImportError('Please enter JSON data');
            return;
        }

        try {
            setImporting(true);
            setImportError(null);
            setImportSuccess(null);

            // Validate JSON format first
            let parsed;
            try {
                parsed = JSON.parse(jsonInput);
            } catch {
                setImportError('Invalid JSON format. Please check your syntax.');
                return;
            }

            if (!Array.isArray(parsed)) {
                setImportError('JSON must be an array of questions');
                return;
            }

            const response = await fetch('/api/admin/questions/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonInput,
            });

            const data = await response.json();

            if (response.ok) {
                setImportSuccess(`Successfully imported ${data.count} questions!`);
                setJsonInput('');
                await fetchQuestions();
                setTimeout(() => {
                    setImportModalOpen(false);
                    setImportSuccess(null);
                }, 2000);
            } else {
                if (data.details && Array.isArray(data.details)) {
                    setImportError(data.details.slice(0, 3).join('\n'));
                } else {
                    setImportError(data.error || 'Import failed');
                }
            }
        } catch (err) {
            console.error('Import error:', err);
            setImportError('Failed to import questions');
        } finally {
            setImporting(false);
        }
    };

    // JSON Schema example for reference
    const jsonSchemaExample = `[
  {
    "questionText": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "difficulty": "easy"
  }
]`;

    const difficultyColors = {
        easy: 'bg-green-500/10 text-green-500 border-green-500/30',
        medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
        hard: 'bg-red-500/10 text-red-500 border-red-500/30',
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading size="lg" text="Loading questions..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Questions</h1>
                    <p className="text-gray-400">Manage your quiz questions</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        Import JSON
                    </Button>
                    <Button onClick={() => setModalOpen(true)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Add Question
                    </Button>
                </div>
            </div>

            {questions.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-xl font-semibold text-white mb-2">No questions yet</h2>
                    <p className="text-gray-400 mb-6">Add your first question to get started</p>
                    <Button onClick={() => setModalOpen(true)}>Add Question</Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <Card key={question._id} className="relative">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                {/* Question number */}
                                <div className="flex-shrink-0 w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
                                    <span className="text-[#39FF14] font-bold">{index + 1}</span>
                                </div>

                                {/* Question content */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start gap-2 mb-3">
                                        <h3 className="text-lg font-medium text-white flex-1">
                                            {question.questionText}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                                difficultyColors[question.difficulty]
                                            }`}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                        {question.options.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`
                          flex items-center gap-2 p-2 rounded-lg text-sm
                          ${
                              optIndex === question.correctAnswer
                                  ? 'bg-[#39FF14]/10 border border-[#39FF14]/30'
                                  : 'bg-[#1a1a1a]'
                          }
                        `}
                                            >
                                                <span
                                                    className={`
                            w-6 h-6 rounded flex items-center justify-center text-xs font-semibold
                            ${
                                optIndex === question.correctAnswer
                                    ? 'bg-[#39FF14] text-black'
                                    : 'bg-[#333] text-gray-400'
                            }
                          `}
                                                >
                                                    {optionLabels[optIndex]}
                                                </span>
                                                <span
                                                    className={
                                                        optIndex === question.correctAnswer
                                                            ? 'text-white'
                                                            : 'text-gray-400'
                                                    }
                                                >
                                                    {option}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 lg:flex-col">
                                    <button
                                        onClick={() => openEditModal(question)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(question._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingQuestion ? 'Edit Question' : 'Add Question'}
                size="lg"
            >
                <QuestionForm
                    question={editingQuestion}
                    onSubmit={editingQuestion ? handleEditQuestion : handleAddQuestion}
                    onCancel={closeModal}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Question"
            >
                <p className="text-gray-400 mb-6">
                    Are you sure you want to delete this question? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => deleteConfirm && handleDeleteQuestion(deleteConfirm)}
                    >
                        Delete
                    </Button>
                </div>
            </Modal>

            {/* JSON Import Modal */}
            <Modal
                isOpen={importModalOpen}
                onClose={() => {
                    setImportModalOpen(false);
                    setJsonInput('');
                    setImportError(null);
                    setImportSuccess(null);
                }}
                title="Import Questions from JSON"
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        Paste a JSON array of questions below. Each question must have:
                    </p>
                    <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                        <li>
                            <code className="text-[#39FF14]">questionText</code> - The question
                            string
                        </li>
                        <li>
                            <code className="text-[#39FF14]">options</code> - Array of exactly 4
                            options
                        </li>
                        <li>
                            <code className="text-[#39FF14]">correctAnswer</code> - Index (0-3) of
                            correct option
                        </li>
                        <li>
                            <code className="text-[#39FF14]">difficulty</code> - Optional:
                            &quot;easy&quot;, &quot;medium&quot;, or &quot;hard&quot;
                        </li>
                    </ul>

                    {/* Error/Success Messages */}
                    {importError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm whitespace-pre-line">
                                {importError}
                            </p>
                        </div>
                    )}
                    {importSuccess && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">{importSuccess}</p>
                        </div>
                    )}

                    {/* JSON Input */}
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={jsonSchemaExample}
                        className="w-full h-64 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-[#39FF14]"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setImportModalOpen(false);
                                setJsonInput('');
                                setImportError(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={importing || !jsonInput.trim()}>
                            {importing ? 'Importing...' : 'Import Questions'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
