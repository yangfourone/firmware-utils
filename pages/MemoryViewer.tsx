import React, { useState, useEffect, useRef } from 'react';
import { Binary, ArrowLeft, Trash2, Upload, FileDigit, X } from 'lucide-react';
import { parseHexStream, bytesToLEWords, readFileAsBytes, formatAddress } from '../services/memoryDumpService';
import { toHex32 } from '../services/bitFieldService'; // Reuse helper
import BitFieldDisplay from '../components/BitFieldDisplay';

interface MemoryViewerProps {
  onBack: () => void;
}

type RowBytesOption = 4 | 8 | 16 | 32;

const MemoryViewer: React.FC<MemoryViewerProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [startAddr, setStartAddr] = useState('');
  const [rowBytes, setRowBytes] = useState<RowBytesOption>(16);
  const [dataWords, setDataWords] = useState<number[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [viewRange, setViewRange] = useState<string>('1');


  // Effect to parse text input when it changes
  useEffect(() => {
    if (!fileName && inputText) {
      const bytes = parseHexStream(inputText);
      const words = bytesToLEWords(bytes);
      setDataWords(words);
    } else if (!fileName && !inputText) {
      setDataWords([]);
    }
  }, [inputText, fileName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const bytes = await readFileAsBytes(file);
      const words = bytesToLEWords(bytes);
      setDataWords(words);
      setFileName(file.name);
      setInputText(''); // Clear text input to avoid confusion
    } catch (err) {
      console.error(err);
      alert("Failed to read file");
    }
  };

  const clearAll = () => {
    setInputText('');
    setFileName(null);
    setDataWords([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wordsPerRow = rowBytes / 4;

  const renderHeaders = () => {
    const headers = [];
    for (let i = 0; i < wordsPerRow; i++) {
      headers.push(
        <div key={i} className="flex-1 text-center text-xs text-slate-500 font-mono py-2 border-b border-slate-700">
          DW{i}
        </div>
      );
    }
    return headers;
  };

  const renderRows = () => {
    if (dataWords.length === 0) {
      return (
        <div className="text-center py-12 text-slate-600 col-span-full">
          Waiting for input data...
        </div>
      );
    }

    const rows = [];
    for (let i = 0; i < dataWords.length; i += wordsPerRow) {
      const rowWords = dataWords.slice(i, i + wordsPerRow);
      const currentByteOffset = i * 4;
      const addrLabel = formatAddress(startAddr, currentByteOffset);

      rows.push(
        <div key={i} className="flex hover:bg-slate-800/50 transition-colors border-b border-slate-700/30 last:border-0">
          {/* Address Column */}
          <div className="w-24 md:w-32 flex-shrink-0 p-2 font-mono text-xs md:text-sm text-slate-400 border-r border-slate-700/50 bg-slate-900/30 truncate select-all text-center">
            {addrLabel}
          </div>

          {/* Data Columns */}
          <div className="flex-1 flex">
            {rowWords.map((word, idx) => (
              <div
                key={idx}
                className="flex-1 p-2 font-mono text-xs md:text-sm text-brand-400 text-center select-all whitespace-nowrap cursor-pointer hover:bg-brand-500/20 hover:text-brand-300 transition-colors rounded-sm"
                onClick={() => setSelectedWordIndex((prevStartIdx) => {
                  // Calculate absolute index in dataWords array
                  const absIndex = i + idx;
                  return absIndex;
                })}
              >
                {toHex32(word).replace('0x', '')}
              </div>
            ))}
            {/* Fill empty cells if last row is incomplete */}
            {rowWords.length < wordsPerRow &&
              Array.from({ length: wordsPerRow - rowWords.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="flex-1 p-2"></div>
              ))
            }
          </div>
        </div>
      );
    }
    return rows;
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
          <Binary className="text-brand-400" size={32} />
          Memory Hex Dump
        </h1>
        <p className="text-slate-400">
          View raw hex data or binary files in Little Endian 32-bit format with configurable row widths.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        {/* Controls/Input Column */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-6">

          {/* Input Area */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-sm transition-all focus-within:border-brand-500/50">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center rounded-t-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Input Data</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-brand-400 hover:text-brand-300 transition-colors p-1"
                  title="Upload .bin file"
                >
                  <Upload size={14} />
                </button>
                <button onClick={clearAll} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Clear All">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".bin,.dat"
                className="hidden"
              />
            </div>

            {fileName ? (
              <div className="h-32 flex flex-col items-center justify-center bg-slate-900/50 text-slate-400 rounded-b-lg gap-2">
                <FileDigit size={32} className="text-slate-600" />
                <span className="text-sm font-mono">{fileName}</span>
                <button
                  onClick={() => { setFileName(null); setDataWords([]); }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Paste hex stream here...\nA3 4F 12 D9...`}
                className="w-full h-32 bg-slate-900/50 text-slate-200 font-mono text-xs p-4 focus:outline-none resize-y rounded-b-lg placeholder:text-slate-600 leading-relaxed"
                spellCheck={false}
              />
            )}
          </div>

          <div className="text-xs text-slate-500 leading-relaxed px-2">
            <p>Paste a hex string or upload a binary file. The viewer processes data as a Byte Stream and displays it as 32-bit Little Endian words.</p>
          </div>
        </div>

        {/* Output Column */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
            {/* Integrated Header with Controls */}
            <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-white font-semibold flex-shrink-0">
                <Binary size={18} className="text-brand-400" />
                <span>Memory Map</span>
              </div>

              {/* Integrated Controls */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Start Address Input */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider">Base Addr:</span>
                  <input
                    type="text"
                    value={startAddr}
                    onChange={(e) => setStartAddr(e.target.value)}
                    placeholder="0x0"
                    className="w-24 sm:w-32 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-mono text-brand-400 focus:border-brand-500 outline-none placeholder:text-slate-600 transition-colors"
                  />
                </div>

                <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                {/* Range Input for Bit Viewer */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider" title="Number of DWs to show in Bit Field Modal">Range:</span>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={viewRange}
                    onChange={(e) => setViewRange(e.target.value)}
                    className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-mono text-brand-400 focus:border-brand-500 outline-none transition-colors text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                {/* Row Width Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider">Width:</span>
                  <div className="flex bg-slate-900 rounded border border-slate-700 p-0.5">
                    {[4, 8, 16, 32].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRowBytes(opt as RowBytesOption)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${rowBytes === opt
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 bg-slate-900/20">
              <div className="min-w-[600px]">
                {/* Headers */}
                <div className="flex bg-slate-800/50">
                  <div className="w-24 md:w-32 flex-shrink-0 p-2 text-center text-xs text-slate-500 font-mono border-b border-slate-700 border-r border-slate-700/50">
                    Address
                  </div>
                  <div className="flex-1 flex">
                    {renderHeaders()}
                  </div>
                </div>
                {/* Rows */}
                <div>
                  {renderRows()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bit Field Modal */}
      {selectedWordIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedWordIndex(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Binary size={20} className="text-brand-400" />
                Bit Field Breakdown
              </h3>
              <button
                onClick={() => setSelectedWordIndex(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <BitFieldDisplay
                words={dataWords.slice(selectedWordIndex, selectedWordIndex + (parseInt(viewRange) || 1))}
                startAddr={
                  // Calculate effective start address for the *selection*
                  (() => {
                    if (!startAddr.trim()) return '';
                    const clean = startAddr.replace(/^0x/i, '');
                    const base = parseInt(clean, 16);
                    if (isNaN(base)) return '';
                    // selection offset
                    const offset = selectedWordIndex * 4;
                    return `0x${((base + offset) >>> 0).toString(16).toUpperCase()}`;
                  })()
                }
              />
            </div>

            <div className="p-3 bg-slate-800/30 text-xs text-slate-500 text-center border-t border-slate-800 rounded-b-xl">
              Displaying {parseInt(viewRange) || 1} DW(s) starting from index {selectedWordIndex}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryViewer;