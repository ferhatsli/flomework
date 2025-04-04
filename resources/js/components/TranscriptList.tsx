import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ChartBarIcon, BeakerIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface Transcript {
    id: number;
    filename: string;
    file_type: string;
    created_at: string;
}

const TranscriptList: React.FC = () => {
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchTranscripts();
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 30 * 1024 * 1024) {
            toast.error('File size must be less than 30MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('transcript_file', file);

        try {
            const response = await axios.post('/api/transcript/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-File-Size': file.size.toString(),
                    'X-File-Name': file.name,
                    'X-File-Type': file.type
                },
                maxBodyLength: Infinity,
                timeout: 0,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data.success) {
                toast.success('Transcript uploaded successfully!');
                await fetchTranscripts(); // Refresh the list after successful upload
                navigate(`/analysis/${response.data.transcript_id}`);
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            if (error.response?.status === 413) {
                toast.error('File size too large. Please try a smaller file.');
            } else if (error.code === 'ECONNABORTED') {
                toast.error('Upload timed out. Please try again with a smaller file or better connection.');
            } else {
                const errorMessage = error.response?.data?.error || error.message || 'Failed to upload transcript';
                toast.error(errorMessage);
                console.error('Detailed error:', error.response || error);
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 30 * 1024 * 1024,
        multiple: false
    });

    const handleDelete = async (transcriptId: number) => {
        if (isDeleting) return; // Prevent multiple deletes at once
        
        if (!window.confirm('Are you sure you want to delete this transcript? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(transcriptId);
        
        try {
            const response = await axios.delete(`/api/transcript/${transcriptId}`);
            if (response.data.success) {
                toast.success('Transcript deleted successfully');
                // Remove the transcript from the local state
                setTranscripts(prev => prev.filter(t => t.id !== transcriptId));
            } else {
                throw new Error(response.data.error || 'Failed to delete transcript');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete transcript');
        } finally {
            setIsDeleting(null);
        }
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Upload Section */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300
                        ${isDragActive 
                            ? 'border-[#E35A4B] bg-[#E35A4B]/10' 
                            : 'border-[#263468] hover:border-[#E35A4B]'}`}
                >
                    <input {...getInputProps()} />
                    <AnimatePresence mode="wait">
                        {isUploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#263468]" />
                                <p className="mt-4 text-xl font-semibold text-[#263468]">
                                    Uploading... {uploadProgress}%
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="dropzone"
                                initial={{ scale: 1 }}
                                animate={{ scale: isDragActive ? 1.1 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowUpTrayIcon className={`h-12 w-12 mx-auto ${
                                    isDragActive ? 'text-[#E35A4B]' : 'text-[#263468]'
                                }`} />
                                <p className="mt-4 text-xl font-semibold text-[#263468]">
                                    {isDragActive ? 'Drop the file here' : 'Drag & drop a transcript file here'}
                                </p>
                                <p className="mt-2 text-lg text-gray-600">
                                    or click to select a file
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Supported formats: TXT, CSV, PDF, DOC, DOCX (max 30MB)
                                </p>
                                {transcripts.length === 0 && (
                                    <p className="mt-4 text-lg text-gray-600">
                                        Upload your first transcript to get started
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Transcripts List Section */}
            {transcripts.length > 0 && (
                <motion.div 
                    className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
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
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <button
                                                onClick={() => handleDelete(transcript.id)}
                                                disabled={isDeleting === transcript.id}
                                                className={`inline-flex items-center px-4 py-2 border-2 border-red-500 text-red-500 text-lg font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-300 ${
                                                    isDeleting === transcript.id ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <TrashIcon className="h-5 w-5 mr-2" />
                                                {isDeleting === transcript.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default TranscriptList; 