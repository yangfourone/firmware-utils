import React, { useState, useCallback } from 'react';
import { Calculator, Copy, Check, ArrowLeft, Trash2 } from 'lucide-react';
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
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header / Nav */}
      <button 
        onClick={onBack}
        className="group flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tools
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calculator className="text-brand-400" size={32} />
            C Macro Calculator
          </h1>
          <p className="text-slate-400">
            Parse and evaluate complex C definitions with mixed decimal, hex, and unsigned suffixes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500 transition-all">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center rounded-t-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Expression Input</span>
              <button onClick={clearInput} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Clear">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. ((0x24000000U) + (4096U * 2))"
              className="w-full h-64 bg-slate-900/50 text-slate-200 font-mono text-sm p-4 focus:outline-none resize-none rounded-b-lg placeholder:text-slate-600"
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 active:scale-[0.99] transition-all flex justify-center items-center gap-2"
          >
            <Calculator size={20} />
            Calculate Result
          </button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-700 pb-2">Results</h2>

            {result?.isError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <strong>Error:</strong> {result.errorMessage}
              </div>
            )}

            {!result && !input && (
              <div className="text-slate-500 text-center py-10 text-sm italic">
                Enter an expression to see results here.
              </div>
            )}

            {result && !result.isError && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Decimal Result */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-500 uppercase">Decimal</label>
                  <div className="group relative bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-xl text-green-400 break-all">
                    {result.decimal}
                    <button 
                      onClick={() => copyToClipboard(result.decimal, false)}
                      className="absolute top-2 right-2 p-2 bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 text-slate-300"
                    >
                      {copiedDec ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Hex Result */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-500 uppercase">Hexadecimal</label>
                  <div className="group relative bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-xl text-brand-400 break-all">
                    {result.hex}
                    <button 
                      onClick={() => copyToClipboard(result.hex, true)}
                      className="absolute top-2 right-2 p-2 bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 text-slate-300"
                    >
                      {copiedHex ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Helper Hint */}
            <div className="mt-auto pt-6 text-xs text-slate-500">
              <p>Supports: <code>0x</code> Hex, <code>U</code> Suffix, <code>( )</code> Nesting, and basic operators.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroCalculator;