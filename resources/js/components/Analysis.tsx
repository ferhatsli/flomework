import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ChartBarIcon, AcademicCapIcon, StarIcon, LightBulbIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
    ogretmen: string;
    ogrenci: string;
    seviye: string;
    guclu_yonler: string[];
    gelistirilmesi_gerekenler: string[];
    yeni_kelimeler: string[];
    ana_konular: string[];
}

interface TranscriptData {
    id: number;
    filename: string;
    analysis_result: AnalysisResult | null;
    file_path: string;
    file_type: string;
    created_at: string;
    updated_at: string;
}

const Analysis: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <motion.div 
                    className="w-16 h-16"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="h-full w-full rounded-full border-4 border-[#263468]/20 border-t-[#263468]" />
                </motion.div>
            </div>
        );
    }

    if (error || !data || !data.analysis_result) {
        return (
            <div className="text-center py-12">
                <p className="text-[#263468] text-xl">{error || 'No analysis data available'}</p>
            </div>
        );
    }

    const analysis = data.analysis_result;

    return (
        <motion.div 
            className="max-w-4xl mx-auto p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-[#263468]/5 flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-[#263468]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-[#263468]">
                                Analysis Results
                            </h2>
                            <p className="text-gray-500 mt-1">{data.filename}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Student Info */}
                    <motion.div 
                        className="bg-[#263468]/5 rounded-2xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <AcademicCapIcon className="h-6 w-6 text-[#263468]" />
                            <h3 className="text-lg font-semibold text-[#263468]">Student Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">Student</p>
                                <p className="text-[#263468] font-medium">{analysis.ogrenci || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">Teacher</p>
                                <p className="text-[#263468] font-medium">{analysis.ogretmen || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">Level</p>
                                <p className="text-[#263468] font-medium">{analysis.seviye || 'N/A'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Strengths */}
                    {analysis.guclu_yonler && analysis.guclu_yonler.length > 0 && (
                        <motion.div 
                            className="bg-green-50 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <StarIcon className="h-6 w-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-green-800">Strengths</h3>
                            </div>
                            <div className="space-y-3">
                                {analysis.guclu_yonler.map((strength, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-white rounded-xl p-4 shadow-sm flex items-start space-x-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                        <p className="text-gray-700">{strength}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Areas for Improvement */}
                    {analysis.gelistirilmesi_gerekenler && analysis.gelistirilmesi_gerekenler.length > 0 && (
                        <motion.div 
                            className="bg-[#E35A4B]/5 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <LightBulbIcon className="h-6 w-6 text-[#E35A4B]" />
                                <h3 className="text-lg font-semibold text-[#E35A4B]">Areas for Improvement</h3>
                            </div>
                            <div className="space-y-3">
                                {analysis.gelistirilmesi_gerekenler.map((area, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-white rounded-xl p-4 shadow-sm flex items-start space-x-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#E35A4B] mt-2 flex-shrink-0" />
                                        <p className="text-gray-700">{area}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* New Vocabulary */}
                    {analysis.yeni_kelimeler && analysis.yeni_kelimeler.length > 0 && (
                        <motion.div 
                            className="bg-[#263468]/5 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <BookOpenIcon className="h-6 w-6 text-[#263468]" />
                                <h3 className="text-lg font-semibold text-[#263468]">New Vocabulary</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analysis.yeni_kelimeler.map((word, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="px-4 py-2 bg-white rounded-full text-[#263468] text-sm font-medium shadow-sm
                                                 border border-[#263468]/10 hover:border-[#263468]/20 transition-colors duration-300"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Main Topics */}
                    {analysis.ana_konular && analysis.ana_konular.length > 0 && (
                        <motion.div 
                            className="bg-[#263468]/5 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <ChartBarIcon className="h-6 w-6 text-[#263468]" />
                                <h3 className="text-lg font-semibold text-[#263468]">Main Topics</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysis.ana_konular.map((topic, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-white rounded-xl p-4 shadow-sm flex items-start space-x-3"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#263468] mt-2 flex-shrink-0" />
                                        <p className="text-gray-700">{topic}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Analysis; 