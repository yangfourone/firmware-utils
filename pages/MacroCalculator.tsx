import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Calculator, Copy, Check, ArrowLeft, Trash2, Play } from 'lucide-react';
import { evaluateMacroExpression } from '../services/calculatorService';
import { CalculationResult } from '../types';

interface MacroCalculatorProps {
  onBack: () => void;
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copiedDec, setCopiedDec] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight for shrinking
      textareaRef.current.style.height = 'auto';
      // Set new height based on content, with a minimum buffer
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  const handleCalculate = useCallback(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    try {
      const { decimal, hex } = evaluateMacroExpression(input);
      setResult({
        decimal,
        hex,
        isError: false
      });
    } catch (err: any) {
      setResult({
        decimal: '',
        hex: '',
        isError: true,
        errorMessage: err.message
      });
    }
  }, [input]);

  const copyToClipboard = (text: string, isHex: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHex) {
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 2000);
    } else {
      setCopiedDec(true);
      setTimeout(() => setCopiedDec(false), 2000);
    }
  };

  const clearInput = () => {
    setInput('');
    setResult(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = '120px';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header / Nav */}
      <div className="mb-6">
        <button 
            onClick={onBack}
            className="group flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
        >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
        </button>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calculator className="text-brand-400" size={32} />
            C Macro Calculator
        </h1>
        <p className="text-slate-400 max-w-2xl">
            Parse and evaluate complex C definitions with mixed decimal, hex, and unsigned suffixes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500 transition-all">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center rounded-t-lg">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Expression Input</span>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCalculate}
                        className="flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded transition-colors shadow-lg shadow-brand-500/20"
                        title="Calculate Result"
                    >
                        <Play size={12} fill="currentColor" />
                        Calculate
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-1"></div>
                    <button onClick={clearInput} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Clear Content">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. ((0x24000000U) + (4096U * 2))"
                className="w-full bg-slate-900/50 text-slate-200 font-mono text-sm p-4 focus:outline-none resize-none rounded-b-lg placeholder:text-slate-600 overflow-hidden min-h-[120px]"
                spellCheck={false}
            />
        </div>

        {/* Results Section */}
        {result && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {result.isError ? (
                     <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-mono">
                        <strong>Error:</strong> {result.errorMessage}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h2 className="text-xs font-mono text-slate-500 uppercase mb-4">Calculation Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Decimal Result */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Decimal</label>
                                <div className="group relative bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xl text-green-400 break-all flex items-center justify-between">
                                    <span>{result.decimal}</span>
                                    <button 
                                        onClick={() => copyToClipboard(result.decimal, false)}
                                        className="p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 text-slate-300 ml-2 flex-shrink-0"
                                    >
                                        {copiedDec ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Hex Result */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Hexadecimal</label>
                                <div className="group relative bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xl text-brand-400 break-all flex items-center justify-between">
                                    <span>{result.hex}</span>
                                    <button 
                                        onClick={() => copyToClipboard(result.hex, true)}
                                        className="p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 text-slate-300 ml-2 flex-shrink-0"
                                    >
                                        {copiedHex ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MacroCalculator;