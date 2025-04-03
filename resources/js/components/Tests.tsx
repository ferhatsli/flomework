import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

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
    tests: Test[] | null;
}

const Tests: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/transcript/${id}`);
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    throw new Error('Failed to fetch test data');
                }
            } catch (error) {
                console.error('Error fetching test data:', error);
                toast.error('Failed to load test questions');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleAnswerSelect = (questionIndex: number, letter: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: letter
        }));
        
        // Automatically move to next question if not on the last question
        if (data?.tests && questionIndex < data.tests.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const calculateProgress = () => {
        if (!data?.tests) return 0;
        return (Object.keys(selectedAnswers).length / data.tests.length) * 100;
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
        if (!data?.tests) return;
        
        const unansweredQuestions = data.tests.reduce((count, _, index) => {
            return count + (selectedAnswers[index] === undefined ? 1 : 0);
        }, 0);

        if (unansweredQuestions > 0) {
            toast.error(`Please answer all questions before submitting. ${unansweredQuestions} question(s) remaining.`);
            return;
        }

        const calculatedScore = calculateScore();
        setScore(calculatedScore);
        setShowResults(true);

        // Show confetti for scores above 80%
        if (calculatedScore >= 80) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const handleRetakeTest = () => {
        setSelectedAnswers({});
        setShowResults(false);
        setScore(null);
        setCurrentQuestionIndex(0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <motion.div 
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#263468]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        );
    }

    if (!data?.tests) {
        return (
            <div className="text-center py-12">
                <p className="text-[#263468] text-xl">No test questions available</p>
            </div>
        );
    }

    if (showResults) {
        return (
            <motion.div 
                className="max-w-4xl mx-auto p-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
            >
                <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-[#263468] mb-8">Test Results</h2>
                    <div className="text-center mb-8">
                        <p className="text-4xl font-bold text-[#263468]">{score}%</p>
                        <p className="text-gray-600 mt-2">
                            You got {data.tests.reduce((count, test, index) => 
                                count + (selectedAnswers[index] === test.correct_answer ? 1 : 0), 0)} out of {data.tests.length} questions correct
                        </p>
                        {score >= 80 ? (
                            <p className="mt-4 text-lg text-green-600 font-medium">
                                🎉 Excellent work! You've mastered this content!
                            </p>
                        ) : score >= 60 ? (
                            <p className="mt-4 text-lg text-[#E35A4B] font-medium">
                                ⚠️ Good effort, but there's room for improvement. Review the explanations below.
                            </p>
                        ) : (
                            <p className="mt-4 text-lg text-red-600 font-medium">
                                ⚠️ You might need to review this content again. Focus on the explanations below.
                            </p>
                        )}
                    </div>

                    <div className="space-y-8">
                        {data.tests.map((test, index) => (
                            <motion.div 
                                key={index} 
                                className="border-2 border-[#263468] rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-start space-x-4">
                                    {selectedAnswers[index] === test.correct_answer ? (
                                        <CheckCircleIcon className="h-6 w-6 text-[#263468] flex-shrink-0" />
                                    ) : (
                                        <XCircleIcon className="h-6 w-6 text-[#E35A4B] flex-shrink-0" />
                                    )}
                                    <div className="flex-grow">
                                        <p className="text-2xl font-semibold text-[#263468] mb-4">
                                            {index + 1}. {test.question}
                                        </p>
                                        <div className="space-y-3">
                                            {test.options.map((option) => (
                                                <div
                                                    key={option.letter}
                                                    className={`p-6 rounded-lg text-lg font-medium border-2 transition-colors duration-300 ${
                                                        option.letter === test.correct_answer
                                                            ? 'bg-[#263468] text-white border-[#263468]'
                                                            : option.letter === selectedAnswers[index]
                                                            ? 'bg-[#E35A4B] text-white border-[#E35A4B]'
                                                            : 'bg-white text-[#263468] border-[#263468]'
                                                    }`}
                                                >
                                                    <span className="font-medium">{option.letter}.</span> {option.text}
                                                </div>
                                            ))}
                                        </div>
                                        {selectedAnswers[index] !== test.correct_answer && (
                                            <div className="mt-6 text-lg">
                                                <p className="font-semibold text-[#263468]">Explanation:</p>
                                                <p className="text-gray-600 mt-2">{test.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleRetakeTest}
                            className="px-6 py-3 text-white bg-[#E35A4B] rounded-lg hover:bg-[#d54d3f] transition-colors duration-300 text-lg font-medium"
                        >
                            Retake Test
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const currentQuestion = data.tests[currentQuestionIndex];
    const progress = calculateProgress();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQuestionIndex}
                    className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#263468] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="mt-2 text-sm text-gray-600 text-right">
                            {Object.keys(selectedAnswers).length} of {data.tests.length} questions answered
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-[#263468]">Test Questions</h2>
                        <span className="text-sm text-gray-500">
                            Question {currentQuestionIndex + 1} of {data.tests.length}
                        </span>
                    </div>

                    <div className="mb-8">
                        <p className="text-2xl font-semibold text-[#263468] mb-8">
                            {currentQuestionIndex + 1}. {currentQuestion.question}
                        </p>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <motion.button
                                    key={option.letter}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswerSelect(currentQuestionIndex, option.letter)}
                                    className={`w-full text-left p-6 rounded-lg text-lg font-medium transition-colors duration-300 border-2 ${
                                        selectedAnswers[currentQuestionIndex] === option.letter
                                            ? 'bg-[#263468] text-white border-[#263468]'
                                            : 'bg-white text-[#263468] border-[#263468] hover:bg-[#E35A4B] hover:text-white hover:border-[#E35A4B]'
                                    }`}
                                >
                                    <span className="font-medium">{option.letter}.</span> {option.text}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        {currentQuestionIndex === data.tests.length - 1 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmitTest}
                                className="flex items-center px-6 py-3 text-white bg-[#E35A4B] rounded-lg hover:bg-[#d54d3f] transition-colors duration-300"
                            >
                                Submit Test
                            </motion.button>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                            {data.tests.map((_, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                                        currentQuestionIndex === index
                                            ? 'bg-[#263468] text-white'
                                            : selectedAnswers[index] !== undefined
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Tests; 