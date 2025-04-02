import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
}

interface TestData {
    id: number;
    questions: Question[];
    total_questions: number;
}

const TestGeneration: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [test, setTest] = useState<TestData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await axios.get(`/api/transcript/${id}/test`);
                if (response.data.success) {
                    setTest(response.data.data);
                    setSelectedAnswers(new Array(response.data.data.questions.length).fill(-1));
                } else {
                    throw new Error('Failed to fetch test');
                }
            } catch (error) {
                toast.error('Failed to load test questions');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [id]);

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (selectedAnswers.includes(-1)) {
            toast.error('Please answer all questions before submitting');
            return;
        }
        setShowResults(true);
    };

    const calculateScore = () => {
        if (!test) return 0;
        return test.questions.reduce((score, question, index) => {
            return score + (question.correct_answer === selectedAnswers[index] ? 1 : 0);
        }, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No test data available</p>
            </div>
        );
    }

    if (showResults) {
        const score = calculateScore();
        const percentage = (score / test.total_questions) * 100;

        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>
                    <div className="text-center mb-8">
                        <p className="text-4xl font-bold text-blue-600">{percentage.toFixed(1)}%</p>
                        <p className="text-gray-600 mt-2">
                            You got {score} out of {test.total_questions} questions correct
                        </p>
                    </div>

                    <div className="space-y-6">
                        {test.questions.map((question, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start">
                                    {selectedAnswers[index] === question.correct_answer ? (
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                                    ) : (
                                        <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{question.question}</p>
                                        <div className="mt-2 space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className={`p-2 rounded ${
                                                        optionIndex === question.correct_answer
                                                            ? 'bg-green-100'
                                                            : optionIndex === selectedAnswers[index]
                                                            ? 'bg-red-100'
                                                            : 'bg-gray-50'
                                                    }`}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Practice Test</h2>
                    <span className="text-sm text-gray-500">
                        Question {currentQuestion + 1} of {test.total_questions}
                    </span>
                </div>

                <div className="mb-8">
                    <p className="text-lg text-gray-900 mb-4">
                        {test.questions[currentQuestion].question}
                    </p>
                    <div className="space-y-3">
                        {test.questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(currentQuestion, index)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedAnswers[currentQuestion] === index
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {currentQuestion === test.total_questions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Submit Test
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.min(test.total_questions - 1, prev + 1))}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestGeneration; 