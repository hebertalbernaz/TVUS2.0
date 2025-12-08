import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export function CampimetryGrid({ value, onChange }) {
  // Grid 10x10 represents the visual field
  // Value is an array of indices that are marked (scotomas)
  const [markedCells, setMarkedCells] = useState(value || []);

  const toggleCell = (index) => {
    let newMarks;
    if (markedCells.includes(index)) {
        newMarks = markedCells.filter(i => i !== index);
    } else {
        newMarks = [...markedCells, index];
    }
    setMarkedCells(newMarks);
    onChange(newMarks);
  };

  return (
    <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-10 gap-1 p-4 bg-gray-900 rounded-full aspect-square w-[300px] h-[300px] relative overflow-hidden border-4 border-gray-700">
            {/* Crosshair overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-full h-px bg-green-500/30"></div>
            </div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="h-full w-px bg-green-500/30"></div>
            </div>

            {Array.from({ length: 100 }).map((_, i) => (
                <div
                    key={i}
                    onClick={() => toggleCell(i)}
                    className={cn(
                        "cursor-pointer transition-all duration-200 rounded-sm border border-white/5 hover:border-white/30",
                        markedCells.includes(i) ? "bg-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]" : "bg-yellow-500/20 hover:bg-yellow-500/40"
                    )}
                />
            ))}
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-[300px]">
            Clique nos setores para marcar áreas de perda visual (Escotomas).
            <br/>
            <span className="inline-block w-3 h-3 bg-yellow-500/20 border mr-1 align-middle"></span> Normal
            <span className="inline-block w-3 h-3 bg-black border ml-3 mr-1 align-middle"></span> Perda
        </p>
    </div>
  );
}
