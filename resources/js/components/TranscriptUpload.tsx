import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const TranscriptUpload: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Check file size before uploading
        if (file.size > 30 * 1024 * 1024) {
            toast.error('File size must be less than 30MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Create form data
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
                timeout: 0, // No timeout
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.data.success) {
                toast.success('Transcript uploaded successfully!');
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

    return (
        <div className="max-w-xl mx-auto p-6">
            <motion.div
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default TranscriptUpload; 