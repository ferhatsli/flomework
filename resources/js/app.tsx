import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navigation from './components/Navigation';
import TranscriptUpload from './components/TranscriptUpload';
import Analysis from './components/Analysis';
import Tests from './components/Tests';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="py-10">
                    <Routes>
                        <Route path="/" element={<TranscriptUpload />} />
                        <Route path="/upload" element={<TranscriptUpload />} />
                        <Route path="/analysis/:id" element={<Analysis />} />
                        <Route path="/tests/:id" element={<Tests />} />
                    </Routes>
                </main>
                <Toaster position="top-right" />
            </div>
        </Router>
    );
};

// Add error logging
const container = document.getElementById('app');
if (container) {
    try {
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('React app mounted successfully');
    } catch (error) {
        console.error('Error mounting React app:', error);
        container.innerHTML = '<div style="color: red; padding: 20px;">Error loading application. Check console for details.</div>';
    }
} else {
    console.error('Root element not found');
} 