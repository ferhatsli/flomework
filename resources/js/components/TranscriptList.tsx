import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ChartBarIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Transcript {
    id: number;
    filename: string;
    file_type: string;
    created_at: string;
}

const TranscriptList: React.FC = () => {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTranscripts = async () => {
            try {
                const response = await axios.get('/api/transcripts');
                if (response.data.success) {
                    setTranscripts(response.data.data);
                } else {
                    throw new Error('Failed to fetch transcripts');
                }
            } catch (error) {
                console.error('Error fetching transcripts:', error);
                toast.error('Failed to load transcripts');
            } finally {
                setLoading(false);
            }
        };

        fetchTranscripts();
    }, []);

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

    if (transcripts.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-[#263468]" />
                    <h3 className="mt-4 text-2xl font-semibold text-[#263468]">No transcripts yet</h3>
                    <p className="mt-2 text-lg text-gray-600">Upload your first transcript to get started.</p>
                    <div className="mt-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                to="/upload"
                                className="inline-flex items-center px-6 py-3 border-2 border-[#E35A4B] rounded-lg shadow-sm text-lg font-medium text-white bg-[#E35A4B] hover:bg-[#d54d3f] transition-colors duration-300"
                            >
                                Upload Transcript
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div 
                className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-[#263468]">Your Transcripts</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {transcripts.map((transcript, index) => (
                        <motion.li 
                            key={transcript.id} 
                            className="p-8 hover:bg-gray-50 transition-colors duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="h-8 w-8 text-[#263468]" />
                                    <div className="ml-4">
                                        <h3 className="text-xl font-medium text-[#263468]">{transcript.filename}</h3>
                                        <p className="text-gray-600">
                                            Uploaded on {new Date(transcript.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            to={`/analysis/${transcript.id}`}
                                            className="inline-flex items-center px-4 py-2 border-2 border-[#263468] text-[#263468] text-lg font-medium rounded-lg hover:bg-[#263468] hover:text-white transition-colors duration-300"
                                        >
                                            <ChartBarIcon className="h-5 w-5 mr-2" />
                                            Analysis
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            to={`/tests/${transcript.id}`}
                                            className="inline-flex items-center px-4 py-2 text-white bg-[#E35A4B] text-lg font-medium rounded-lg hover:bg-[#d54d3f] transition-colors duration-300"
                                        >
                                            <BeakerIcon className="h-5 w-5 mr-2" />
                                            Tests
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
};

export default TranscriptList; 