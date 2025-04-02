import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChartBarIcon, DocumentTextIcon, AcademicCapIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface AnalysisResult {
    ogretmen: string;
    ogrenci: string;
    seviye: string;
    guclu_yonler: string[];
    gelistirilmesi_gerekenler: string[];
    yeni_kelimeler: string[];
    ana_konular: string[];
}

interface Test {
    question: string;
    options: {
        letter: string;
        text: string;
    }[];
    correct_answer: string;
    explanation: string;
}

interface TranscriptData {
    id: number;
    filename: string;
    analysis_result: AnalysisResult | null;
    tests: Test[] | null;
    file_path: string;
    file_type: string;
    created_at: string;
    updated_at: string;
}

const TranscriptAnalysis: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await axios.get(`/api/transcript/${id}`);
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    throw new Error('Failed to fetch analysis');
                }
            } catch (error) {
                console.error('Error fetching analysis:', error);
                setError('Failed to load analysis results');
                toast.error('Failed to load analysis results');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAnalysis();
        }
    }, [id]);

    const handleAnswerSelect = (questionIndex: number, letter: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: letter
        }));
    };

    const calculateScore = () => {
        if (!data?.tests) return 0;
        const totalQuestions = data.tests.length;
        const correctAnswers = data.tests.reduce((count, test, index) => {
            return count + (selectedAnswers[index] === test.correct_answer ? 1 : 0);
        }, 0);
        return Math.round((correctAnswers / totalQuestions) * 100);
    };

    const handleSubmitTest = () => {
        const calculatedScore = calculateScore();
        setScore(calculatedScore);
        setShowResults(true);
    };

    const handleRetakeTest = () => {
        setSelectedAnswers({});
        setShowResults(false);
        setScore(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !data || !data.analysis_result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">{error || 'No analysis data available'}</p>
            </div>
        );
    }

    const analysis = data.analysis_result;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-500" />
                        Analysis Results for {data.filename}
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Student Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Student Information</h3>
                        <p className="text-gray-700">Student: {analysis.ogrenci || 'N/A'}</p>
                        <p className="text-gray-700">Teacher: {analysis.ogretmen || 'N/A'}</p>
                        <p className="text-gray-700">Level: {analysis.seviye || 'N/A'}</p>
                    </div>

                    {/* Strengths */}
                    {analysis.guclu_yonler && analysis.guclu_yonler.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Strengths</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {analysis.guclu_yonler.map((strength, index) => (
                                    <li key={index} className="text-gray-700">{strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Areas for Improvement */}
                    {analysis.gelistirilmesi_gerekenler && analysis.gelistirilmesi_gerekenler.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Areas for Improvement</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {analysis.gelistirilmesi_gerekenler.map((area, index) => (
                                    <li key={index} className="text-gray-700">{area}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* New Vocabulary */}
                    {analysis.yeni_kelimeler && analysis.yeni_kelimeler.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">New Vocabulary</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.yeni_kelimeler.map((word, index) => (
                                    <span key={index} className="px-2 py-1 bg-purple-100 rounded-full text-purple-700 text-sm">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Topics */}
                    {analysis.ana_konular && analysis.ana_konular.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Main Topics</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {analysis.ana_konular.map((topic, index) => (
                                    <li key={index} className="text-gray-700">{topic}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Tests Section */}
            {data.tests && data.tests.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <BeakerIcon className="h-6 w-6 mr-2 text-blue-500" />
                            Generated Tests
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            {data.tests.map((test, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <p className="font-medium text-gray-900 mb-3">
                                        {index + 1}. {test.question}
                                    </p>
                                    <div className="space-y-2">
                                        {test.options.map((option) => (
                                            <div
                                                key={option.letter}
                                                onClick={() => !showResults && handleAnswerSelect(index, option.letter)}
                                                className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                                                    showResults
                                                        ? option.letter === test.correct_answer
                                                            ? 'bg-green-100 border-green-500'
                                                            : selectedAnswers[index] === option.letter
                                                            ? 'bg-red-100 border-red-500'
                                                            : 'bg-gray-50'
                                                        : selectedAnswers[index] === option.letter
                                                        ? 'bg-blue-100 border-blue-500'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                } ${
                                                    showResults && option.letter === test.correct_answer
                                                        ? 'border-2'
                                                        : 'border'
                                                }`}
                                            >
                                                <span className="font-medium text-gray-700 mr-2">{option.letter}.</span>
                                                <span className="text-gray-700">{option.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {showResults && (
                                        <div className="mt-4 pt-3 border-t">
                                            <p className="text-sm text-gray-500">
                                                <span className="font-medium">Your Answer:</span>{' '}
                                                {selectedAnswers[index] || 'Not answered'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-medium">Correct Answer:</span>{' '}
                                                {test.correct_answer}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Explanation:</span> {test.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            {!showResults ? (
                                <button
                                    onClick={handleSubmitTest}
                                    disabled={Object.keys(selectedAnswers).length !== data.tests.length}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Submit Test
                                </button>
                            ) : (
                                <div className="text-center">
                                    <div className="mb-4">
                                        <p className="text-xl font-semibold">Your Score: {score}%</p>
                                        <p className="text-gray-600">
                                            {score === 100
                                                ? 'Perfect! Excellent work!'
                                                : score >= 80
                                                ? 'Great job! Keep it up!'
                                                : score >= 60
                                                ? 'Good effort! Room for improvement.'
                                                : 'Keep practicing! You can do better.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRetakeTest}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Retake Test
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptAnalysis;