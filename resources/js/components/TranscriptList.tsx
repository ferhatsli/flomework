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
    test_completed: boolean;
    test_score: number | null;
    completed_at: string | null;
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
                    className="w-16 h-16"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="h-full w-full rounded-full border-4 border-[#263468]/20 border-t-[#263468]" />
                </motion.div>
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
                    className={`
                        bg-white rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                        border-2 border-dashed
                        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                        hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)]
                        ${isDragActive 
                            ? 'border-[#E35A4B] bg-[#E35A4B]/5' 
                            : 'border-[#263468]/30 hover:border-[#E35A4B]'}
                    `}
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
                                {/* Progress Circle */}
                                <svg className="w-16 h-16" viewBox="0 0 36 36">
                                    <circle
                                        cx="18" cy="18" r="16"
                                        fill="none"
                                        className="stroke-[#E35A4B]/20"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18" cy="18" r="16"
                                        fill="none"
                                        className="stroke-[#E35A4B]"
                                        strokeWidth="3"
                                        strokeDasharray={`${uploadProgress}, 100`}
                                        transform="rotate(-90 18 18)"
                                    />
                                    <text
                                        x="18" y="18"
                                        textAnchor="middle"
                                        dy=".3em"
                                        className="fill-[#263468] text-sm font-medium"
                                    >
                                        {uploadProgress}%
                                    </text>
                                </svg>
                                <p className="mt-4 text-xl font-semibold text-[#263468]">
                                    Uploading...
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="dropzone"
                                className="space-y-4"
                            >
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#263468]/5 flex items-center justify-center">
                                    <ArrowUpTrayIcon className={`h-8 w-8 ${
                                        isDragActive ? 'text-[#E35A4B]' : 'text-[#263468]'
                                    }`} />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-[#263468]">
                                        {isDragActive ? 'Drop the file here' : 'Upload your transcript'}
                                    </p>
                                    <p className="mt-2 text-gray-500">
                                        Drag & drop or click to select
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    {['TXT', 'CSV', 'PDF', 'DOC'].map(format => (
                                        <span key={format} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                                            {format}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Transcripts List Section */}
            {transcripts.length > 0 && (
                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-2xl font-semibold text-[#263468] mb-6">Your Transcripts</h2>
                    
                    {transcripts.map((transcript, index) => (
                        <motion.div 
                            key={transcript.id}
                            className="group relative bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                                     hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-[#263468]/5 flex items-center justify-center">
                                        <DocumentTextIcon className="h-6 w-6 text-[#263468]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-[#263468]">
                                            {transcript.filename}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-gray-500">
                                                {new Date(transcript.created_at).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            {transcript.test_completed && (
                                                <div className="flex items-center space-x-1">
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <div className="flex items-center text-sm">
                                                        <span className={`font-medium ${
                                                            transcript.test_completed && transcript.test_score
                                                                ? transcript.test_score >= 80
                                                                    ? 'text-green-600'
                                                                    : transcript.test_score >= 60
                                                                        ? 'text-yellow-600'
                                                                        : 'text-red-600'
                                                                : 'text-gray-600'
                                                        }`}>
                                                            Score: {transcript.test_score}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to={`/analysis/${transcript.id}`}
                                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                                                 bg-[#263468] text-white hover:bg-[#263468]/90 transition-colors duration-300"
                                    >
                                        <ChartBarIcon className="h-4 w-4 mr-2" />
                                        Analysis
                                    </Link>
                                    <Link
                                        to={`/tests/${transcript.id}`}
                                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                                                 ${transcript.test_completed && transcript.test_score
                                                    ? transcript.test_score >= 80
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : transcript.test_score >= 60
                                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                                            : 'bg-[#E35A4B] hover:bg-[#E35A4B]/90'
                                                    : 'bg-[#E35A4B] hover:bg-[#E35A4B]/90'} 
                                                 text-white transition-colors duration-300`}
                                    >
                                        <BeakerIcon className="h-4 w-4 mr-2" />
                                        {transcript.test_completed ? 'View Results' : 'Take Test'}
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(transcript.id)}
                                        disabled={isDeleting === transcript.id}
                                        className={`p-2 text-gray-400 hover:text-[#E35A4B] transition-colors duration-300 
                                                  ${isDeleting === transcript.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default TranscriptList; 