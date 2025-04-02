import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const TranscriptUpload: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('transcript_file', file);

        try {
            const response = await axios.post('/api/transcript/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Transcript uploaded successfully!');
                // Navigate to the analysis page with the transcript ID
                navigate(`/analysis/${response.data.transcript_id}`);
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to upload transcript');
        } finally {
            setIsUploading(false);
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
    });

    return (
        <div className="max-w-xl mx-auto p-6">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
                <input {...getInputProps()} />
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a transcript file here'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    or click to select a file
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    Supported formats: TXT, PDF, DOC, DOCX (max 10MB)
                </p>
            </div>
            {isUploading && (
                <div className="mt-4 text-center text-sm text-gray-600">
                    Uploading and analyzing transcript...
                </div>
            )}
        </div>
    );
};

export default TranscriptUpload; 