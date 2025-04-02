import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

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
        </div>
    );
};

export default Analysis; 