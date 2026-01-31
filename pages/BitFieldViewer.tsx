import React, { useState, useEffect } from 'react';
import { Cpu, ArrowLeft, Trash2, Grid3X3, List } from 'lucide-react';
import { parseBitFields, toHex32 } from '../services/bitFieldService';

interface BitFieldViewerProps {
  onBack: () => void;
}

const BitFieldViewer: React.FC<BitFieldViewerProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [startAddr, setStartAddr] = useState('');
  const [words, setWords] = useState<number[]>([]);
  
  // Auto-analyze when input changes (debounced slightly via effect or just direct)
  useEffect(() => {
    try {
      const result = parseBitFields(input);
      setWords(result);
    } catch (e) {
      // If parsing fails, just keep words empty or last valid state
      // For this tool, we'll just clear it if empty
      if (!input.trim()) setWords([]);
    }
  }, [input]);

  const clearInput = () => {
    setInput('');
    setWords([]);
    // Optional: clear start address? User might want to keep it. Keeping it for now.
  };

  // Determine width of the label column based on whether we are showing full addresses or short DW labels
  const labelColWidth = startAddr.trim() ? 'w-24' : 'w-12';

  // Helper to calculate label (DWx or Address)
  const getAddressLabel = (index: number) => {
    const raw = startAddr.trim();
    if (!raw) return `DW${index}`;

    // Remove 0x if present
    const clean = raw.replace(/^0x/i, '');
    const base = parseInt(clean, 16);

    if (isNaN(base)) return `DW${index}`;

    // Calculate offset (4 bytes per word) and ensure unsigned 32-bit wrap
    const currentAddr = (base + (index * 4)) >>> 0;
    return toHex32(currentAddr);
  };

  // Helper to render bit columns headers
  const renderHeaders = () => {
    const cols = [];
    for (let i = 31; i >= 0; i--) {
      // Add extra spacing visually every 8 bits (byte boundary) and 4 bits (nibble)
      const isByteBoundary = i % 8 === 0 && i !== 0;
      const isNibbleBoundary = i % 4 === 0 && i !== 0;
      
      let borderClass = 'border-r border-slate-700';
      if (isByteBoundary) borderClass = 'border-r-2 border-slate-500';
      else if (isNibbleBoundary) borderClass = 'border-r border-slate-600';
      if (i === 0) borderClass = '';

      cols.push(
        <div key={`h-${i}`} className={`flex-1 text-center text-[10px] text-slate-500 font-mono py-1 ${borderClass} min-w-0`}>
          {i}
        </div>
      );
    }
    return cols;
  };

  // Helper to render a single row of bits
  const renderRow = (val: number, index: number) => {
    const label = getAddressLabel(index);
    const bits = [];
    for (let i = 31; i >= 0; i--) {
      const bit = (val >>> i) & 1;
      
      const isByteBoundary = i % 8 === 0 && i !== 0;
      const isNibbleBoundary = i % 4 === 0 && i !== 0;
      
      let borderClass = 'border-r border-slate-700/50';
      if (isByteBoundary) borderClass = 'border-r-2 border-slate-600';
      else if (isNibbleBoundary) borderClass = 'border-r border-slate-700';
      if (i === 0) borderClass = '';

      const bgClass = bit ? 'bg-brand-500/20 text-brand-400 font-bold' : 'text-slate-600';

      bits.push(
        <div key={`b-${i}`} className={`flex-1 h-8 flex items-center justify-center font-mono text-xs ${borderClass} ${bgClass} min-w-0`}>
          {bit}
        </div>
      );
    }
    return (
      <div className="flex items-center hover:bg-slate-800/50 transition-colors">
        <div 
          className={`${labelColWidth} flex-shrink-0 text-[10px] md:text-xs font-mono text-slate-400 pl-2 truncate transition-all duration-300`} 
          title={label}
        >
          {label}
        </div>
        <div className="flex-1 flex border border-slate-700 rounded-sm bg-slate-900 overflow-hidden">
          {bits}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button 
          onClick={onBack}
          className="group flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Tools
        </button>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Cpu className="text-brand-400" size={32} />
          Bit Field Viewer
        </h1>
        <p className="text-slate-400">
          Visualize memory dumps or register values as bit fields. Supports auto-detection of Byte Stream (Little Endian reconstruction) vs Word Lists.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        {/* Input Column - Order 2 on mobile (bottom), Order 1 on Desktop (left) */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-4">
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500 transition-all">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center rounded-t-lg gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider whitespace-nowrap">Input Data</span>
              <button onClick={clearInput} className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0" title="Clear Data">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Example 1:\n0xFF000000\n\nExample 2 (Bin):\nFF AA BB CC`}
              className="w-full h-32 bg-slate-900/50 text-slate-200 font-mono text-xs p-4 focus:outline-none resize-y rounded-b-lg placeholder:text-slate-600 leading-relaxed"
              spellCheck={false}
            />
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
             <div className="flex items-center gap-2 mb-2 text-slate-300 font-semibold">
                <List size={16} />
                <span>Parsed Values</span>
             </div>
             <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {words.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">No valid data...</span>
                ) : (
                    words.map((w, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-mono border-b border-slate-700/50 last:border-0 pb-1">
                            <span className="text-slate-500 select-all">{getAddressLabel(idx)}</span>
                            <span className="text-brand-400 select-all">{toHex32(w)}</span>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>

        {/* Visualization Column - Order 1 on mobile (top), Order 2 on Desktop (right) */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
             <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-white font-semibold flex-shrink-0">
                    <Grid3X3 size={18} className="text-brand-400"/>
                    <span>Bit Field Map</span>
                </div>

                {/* Base Address Input */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider">Base Addr:</span>
                    <input
                      type="text"
                      value={startAddr}
                      onChange={(e) => setStartAddr(e.target.value)}
                      placeholder="0x..."
                      className="w-24 sm:w-32 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-mono text-brand-400 focus:border-brand-500 outline-none placeholder:text-slate-600 transition-colors"
                      title="Enter base address (e.g. 0x2000). If empty, displays DW offset."
                    />
                </div>
             </div>
             
             <div className="p-4 overflow-x-auto">
                <div className="w-full min-w-[600px]">
                    {/* Table Header */}
                    <div className="flex mb-2">
                        <div className={`${labelColWidth} flex-shrink-0 transition-all duration-300`}></div> {/* Spacer for DW label */}
                        <div className="flex-1 flex px-[1px]">
                            {renderHeaders()}
                        </div>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-2">
                        {words.length === 0 && (
                            <div className="text-center py-12 text-slate-600">
                                Enter data to visualize bit fields.
                            </div>
                        )}
                        {words.map((word, idx) => renderRow(word, idx))}
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitFieldViewer;