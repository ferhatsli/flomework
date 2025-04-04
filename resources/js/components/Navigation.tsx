import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navigation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const getNavItems = () => {
        const items = [
            { name: 'Home', href: '/' }
        ];

        // Only add Analysis and Tests links if we have a transcript ID
        if (id) {
            items.push(
                { name: 'Analysis', href: `/analysis/${id}` },
                { name: 'Tests', href: `/tests/${id}` }
            );
        } else if (location.pathname.includes('/analysis/') || location.pathname.includes('/tests/')) {
            // Extract ID from current path if we're on analysis or tests page
            const pathId = location.pathname.split('/').pop();
            if (pathId) {
                items.push(
                    { name: 'Analysis', href: `/analysis/${pathId}` },
                    { name: 'Tests', href: `/tests/${pathId}` }
                );
            }
        }

        return items;
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path.split('/')[1]);
    };

    const navigation = getNavItems();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-[#263468] hover:text-[#E35A4B] transition-colors duration-300">
                                Flalingo
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-300 ${
                                        isActive(item.href)
                                            ? 'border-[#E35A4B] text-[#263468]'
                                            : 'border-transparent text-gray-500 hover:text-[#263468] hover:border-[#263468]'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                                isActive(item.href)
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 