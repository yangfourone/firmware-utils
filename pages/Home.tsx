import React from 'react';
import { Calculator, Cpu } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import { Tool } from '../types';

interface HomeProps {
  onNavigate: (path: string) => void;
}

const tools: Tool[] = [
  {
    id: 'macro-calc',
    name: 'C Macro Calculator',
    description: 'Evaluate complex C preprocessor macro definitions. Handles hex (0x), unsigned suffixes (U), and nested parentheses mixed with standard arithmetic.',
    path: '/macro-calc',
    icon: Calculator
  },
  {
    id: 'bit-fields',
    name: 'Register Bit Fields',
    description: 'Visualize memory dumps or register values. Converts byte streams (Little Endian) or hex lists into a 32-bit broken-down grid.',
    path: '/bit-fields',
    icon: Cpu
  }
];

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Developer <span className="text-brand-400">Toolkit</span>
        </h1>
        <p className="text-lg text-slate-400">
          A suite of precision tools designed for firmware engineers and embedded systems developers.
          Optimize your workflow with accurate calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <ToolCard 
            key={tool.id} 
            tool={tool} 
            onClick={onNavigate} 
          />
        ))}
      </div>
    </div>
  );
};

export default Home;