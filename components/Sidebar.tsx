
import React from 'react';
import UgcToolIcon from './icons/UgcToolIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import PersonalBrandingIcon from './icons/PersonalBrandingIcon';
import ImageIcon from './icons/ImageIcon';
import ColoringBookIcon from './icons/ColoringBookIcon';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeTool: string;
  onToolChange: (toolId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle, activeTool, onToolChange }) => {
  const desktopNavItems = [
    { id: 'ugc-tool', name: 'UGC Filmmaker', icon: UgcToolIcon },
    { id: 'personal-branding', name: 'Personal Branding', icon: PersonalBrandingIcon },
    { id: 'image-gemini-3', name: 'Image Gemini 3', icon: ImageIcon },
    { id: 'coloring-book', name: 'Coloring Book', icon: ColoringBookIcon },
  ];

  const mobileNavItems = [
    { id: 'ugc-tool', name: 'Filmmaker', icon: UgcToolIcon },
    { id: 'personal-branding', name: 'Personal', icon: PersonalBrandingIcon },
    { id: 'image-gemini-3', name: 'Gemini 3', icon: ImageIcon },
    { id: 'coloring-book', name: 'Coloring', icon: ColoringBookIcon },
  ];

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
        <div className={`h-16 flex items-center border-b border-gray-200 ${isExpanded ? 'justify-center' : 'justify-center'}`}>
          <h1 className={`text-2xl font-bold text-gray-900 overflow-hidden ${isExpanded ? 'block' : 'hidden md:block'}`}>
            {isExpanded ? 'bikin sendiri' : <span className="text-purple-600 font-bold">b</span>}
          </h1>
        </div>
        <nav className="flex-1 px-2 md:px-4 py-6 space-y-2 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => { e.preventDefault(); onToolChange(item.id); }}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTool === item.id ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} ${!isExpanded ? 'justify-center' : ''}`}
                aria-current={activeTool === item.id ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                <span className={isExpanded ? 'block' : 'hidden'}>{item.name}</span>
              </a>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
          </button>
        </div>
      </aside>

      {/* --- Mobile Top Navigation --- */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 flex justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); onToolChange(item.id); }}
              className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors h-16 ${activeTool === item.id ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-current={activeTool === item.id ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs tracking-tight mt-1">{item.name}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
