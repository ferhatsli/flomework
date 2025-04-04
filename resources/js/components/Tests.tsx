import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    test_completed: boolean;
    test_score: number | null;
    test_answers: { [key: number]: string } | null;
    completed_at: string | null;
}

const Tests: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/transcript/${id}`);
                console.log('API Response:', response.data); // Debug log
                
                if (response.data.success) {
                    const transcriptData = response.data.data;
                    console.log('Transcript Data:', transcriptData); // Debug log
                    setData(transcriptData);
                    
                    // If test was completed, show the results immediately
                    if (transcriptData.test_completed) {
                        console.log('Test was completed, showing results'); // Debug log
                        console.log('Test Score:', transcriptData.test_score);
                        console.log('Test Answers:', transcriptData.test_answers);
                        
                        setShowResults(true);
                        setScore(transcriptData.test_score);
                        if (transcriptData.test_answers) {
                            // Convert test_answers from backend format if needed
                            const answers = typeof transcriptData.test_answers === 'string' 
                                ? JSON.parse(transcriptData.test_answers) 
                                : transcriptData.test_answers;
                            console.log('Parsed Answers:', answers); // Debug log
                            setSelectedAnswers(answers);
                        }
                    } else {
                        console.log('Test not completed yet'); // Debug log
                    }
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

    // Add a debug effect to monitor state changes
    useEffect(() => {
        console.log('State Update:', {
            showResults,
            score,
            selectedAnswers,
            'data?.test_completed': data?.test_completed
        });
    }, [showResults, score, selectedAnswers, data]);

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

    const handleSubmitTest = async () => {
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

        try {
            // Save test results to backend
            await axios.post(`/api/transcript/${id}/test-completion`, {
                test_score: calculatedScore,
                test_answers: selectedAnswers,
                completed_at: new Date().toISOString()
            });

            // Show confetti for scores above 80%
            if (calculatedScore >= 80) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error('Error saving test results:', error);
            toast.error('Failed to save test results');
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
                <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                    {/* Header with Score */}
                    <div className="px-8 py-10 text-center relative overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        >
                            <h2 className="text-2xl font-semibold text-[#263468] mb-12">Test Results</h2>
                            
                            {/* Score Display */}
                            <div className="relative mb-8">
                                <motion.div 
                                    className="w-48 h-48 mx-auto"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className={`text-[120px] font-bold ${
                                        score && score >= 80 ? 'text-green-500' :
                                        score && score >= 60 ? 'text-yellow-500' :
                                        'text-[#E35A4B]'
                                    }`}>
                                        {score}
                                        <span className="text-4xl ml-1">%</span>
                                    </div>
                                </motion.div>
                            </div>

                            <p className="text-gray-600 text-lg mb-6">
                                You got {data.tests.reduce((count, test, index) => 
                                    count + (selectedAnswers[index] === test.correct_answer ? 1 : 0), 0)} out of {data.tests.length} questions correct
                            </p>

                            {/* Status Message */}
                            {score !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className={`inline-flex items-center px-6 py-3 rounded-xl ${
                                        score >= 80 
                                            ? 'bg-green-50'
                                            : score >= 60
                                            ? 'bg-yellow-50'
                                            : 'bg-red-50'
                                    }`}
                                >
                                    <span className="text-xl mr-3">
                                        {score >= 80 ? '🎉' : '⚠️'}
                                    </span>
                                    <p className={`text-lg font-medium ${
                                        score >= 80 
                                            ? 'text-green-700'
                                            : score >= 60
                                            ? 'text-yellow-700'
                                            : 'text-[#E35A4B]'
                                    }`}>
                                        {score >= 80
                                            ? 'Excellent work! You\'ve mastered this content!'
                                            : score >= 60
                                            ? 'Good effort, but there\'s room for improvement.'
                                            : 'You might need to review this content again.'}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Questions Review */}
                    <div className="mt-8 px-8 py-6 border-t border-gray-100">
                        <div className="space-y-6">
                            {data.tests.map((test, index) => (
                                <motion.div 
                                    key={index} 
                                    className="border border-gray-200 hover:border-[#263468]/20 rounded-xl p-6 transition-all duration-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {selectedAnswers[index] === test.correct_answer ? (
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                    <XCircleIcon className="h-5 w-5 text-[#E35A4B]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-xl font-semibold text-[#263468] mb-4">
                                                {index + 1}. {test.question}
                                            </p>
                                            <div className="space-y-3">
                                                {test.options.map((option) => (
                                                    <div
                                                        key={option.letter}
                                                        className={`p-4 rounded-xl text-lg font-medium transition-colors duration-300 ${
                                                            option.letter === test.correct_answer
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : option.letter === selectedAnswers[index]
                                                                ? 'bg-red-50 text-[#E35A4B] border border-red-200'
                                                                : 'bg-gray-50 text-gray-500 border border-gray-100'
                                                        }`}
                                                    >
                                                        <span className="font-medium">{option.letter}.</span> {option.text}
                                                    </div>
                                                ))}
                                            </div>
                                            {selectedAnswers[index] !== test.correct_answer && (
                                                <motion.div 
                                                    className="mt-4 p-4 bg-[#263468]/5 rounded-xl"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <p className="font-semibold text-[#263468] mb-2">Explanation:</p>
                                                    <p className="text-gray-600">{test.explanation}</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="px-8 py-6 border-t border-gray-100 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            className="px-6 py-3 text-white bg-[#263468] rounded-xl hover:bg-[#263468]/90 
                                     transition-colors duration-300 text-lg font-medium shadow-sm"
                        >
                            Back to Home
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
                            {currentQuestion.options.map((option) => (
                                <motion.button
                                    key={option.letter}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
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