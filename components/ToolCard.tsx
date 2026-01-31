import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: (path: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const Icon = tool.icon;

  return (
    <div 
      onClick={() => onClick(tool.path)}
      className="group relative bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
          <Icon size={24} />
        </div>
        <ArrowRight className="text-slate-600 group-hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
        {tool.name}
      </h3>
      
      <p className="text-slate-400 text-sm leading-relaxed flex-grow">
        {tool.description}
      </p>
    </div>
  );
};

export default ToolCard;