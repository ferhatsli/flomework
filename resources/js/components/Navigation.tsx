import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
    Bars3Icon, 
    XMarkIcon, 
    BellIcon, 
    GiftIcon, 
    ChatBubbleLeftIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

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
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and nav items */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <span className="text-2xl font-bold">
                                    <span className="text-[#263468]">Fla</span>
                                    <span className="text-[#E35A4B]">lingo</span>
                                </span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-300
                                        ${isActive(item.href)
                                            ? 'border-[#263468] text-[#263468] font-semibold'
                                            : 'border-transparent text-gray-500 hover:text-[#263468] hover:border-[#263468]/30'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Utility icons */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-[#263468] transition-colors duration-300">
                            <BellIcon className="h-6 w-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#263468] transition-colors duration-300">
                            <GiftIcon className="h-6 w-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#263468] transition-colors duration-300">
                            <ChatBubbleLeftIcon className="h-6 w-6" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#263468] transition-colors duration-300">
                            <QuestionMarkCircleIcon className="h-6 w-6" />
                        </button>
                        
                        {/* Profile/Avatar */}
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-[#E35A4B] flex items-center justify-center text-white">
                                F
                            </div>
                            <span className="text-sm text-gray-500">21:02 EU/Ist</span>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#263468] hover:bg-gray-100 focus:outline-none"
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
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`block px-4 py-2 text-base font-medium border-l-4 ${
                                isActive(item.href)
                                    ? 'border-[#263468] text-[#263468] bg-[#263468]/5'
                                    : 'border-transparent text-gray-500 hover:text-[#263468] hover:bg-gray-50'
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