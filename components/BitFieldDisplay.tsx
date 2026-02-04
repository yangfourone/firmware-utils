import React from 'react';
import { toHex32 } from '../services/bitFieldService';

interface BitFieldDisplayProps {
    words: number[];
    startAddr: string;
}

const BitFieldDisplay: React.FC<BitFieldDisplayProps> = ({ words, startAddr }) => {
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
            <div key={index} className="flex items-center hover:bg-slate-800/50 transition-colors">
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
        <div className="w-full min-w-[600px] bg-slate-800/20 p-2 rounded">
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
                    <div className="text-center py-6 text-slate-600 italic">
                        No data to display.
                    </div>
                )}
                {words.map((word, idx) => renderRow(word, idx))}
            </div>
        </div>
    );
};

export default BitFieldDisplay;
