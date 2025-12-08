import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';
import { Button } from '@/components/ui/button';
import { Eraser, Pen, Save, Undo, X } from 'lucide-react';

// Placeholder for schematic background (base64 of a simple eye diagram)
// In production this should be an actual SVG or Image URL
const RETINA_BG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTAwIj4KICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIyNTAiIHI9IjI0MCIgZmlsbD0iI2ZmZjVlNiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzNTAiIGN5PSIyNTAiIHI9IjMwIiBmaWxsPSIjZmZlZGMwIiBzdHJva2U9IiM1NTUiIHN0cm9rZS13aWR0aD0iMSIvPiA8IS0tIE9wdGljIERpc2MgLS0+CiAgPGNpcmNsZSBjeD0iMTgwIiBjeT0iMjUwIiByPSIyMCIgZmlsbD0iI2NhNjcxZSIgb3BhY2l0eT0iMC42Ii8+IDwhLS0gTWFjdWxhIC0tPgogIDxwYXRoIGQ9Ik0zNTAsMjUwIEMzMDAsMjAwIDIwMCwyMDAgMTUwLDI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTM0MjM0IiBzdHJva2Utd2lkdGg9IjMiIG9wYWNpdHk9IjAuNSIvPgogIDxwYXRoIGQ9Ik0zNTAsMjUwIEMzMDAsMzAwIDIwMCwzMDAgMTUwLDI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTM0MjM0IiBzdHJva2Utd2lkdGg9IjMiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=';

const RetinaImage = () => {
  const [image] = useImage(RETINA_BG);
  return <KonvaImage image={image} width={500} height={500} />;
};

export function EyeFundusEditor({ onSave, initialImage }) {
  const [tool, setTool] = useState('pen'); // pen, eraser
  const [color, setColor] = useState('#df4b26'); // Default Red
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  // Load initial state if provided (not fully implemented for re-edit of lines, just reloads image usually)
  // For simple drawing, we might just clear or load a bg. 
  // Supporting re-edit of lines requires saving JSON, not just base64. 
  // For MVP, we export image and import as BG if needed, but here we just start fresh or overlay.

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // Add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    // Replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    onSave(uri);
  };

  const handleUndo = () => {
      setLines(lines.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-gray-100 p-4 rounded-lg border">
      <div className="flex gap-2 mb-2">
        <Button 
            variant={tool === 'pen' && color === '#df4b26' ? "default" : "outline"}
            size="sm"
            onClick={() => { setTool('pen'); setColor('#df4b26'); }}
            className="gap-2"
        >
            <div className="w-3 h-3 rounded-full bg-[#df4b26]"></div> Hemorragia
        </Button>
        <Button 
            variant={tool === 'pen' && color === '#fcd34d' ? "default" : "outline"}
            size="sm"
            onClick={() => { setTool('pen'); setColor('#fcd34d'); }}
            className="gap-2"
        >
            <div className="w-3 h-3 rounded-full bg-[#fcd34d]"></div> Exsudato
        </Button>
        <Button 
            variant={tool === 'pen' && color === '#000000' ? "default" : "outline"}
            size="sm"
            onClick={() => { setTool('pen'); setColor('#000000'); }}
            className="gap-2"
        >
            <div className="w-3 h-3 rounded-full bg-black"></div> Lesão
        </Button>
        <div className="w-px bg-gray-300 mx-2"></div>
        <Button 
            variant={tool === 'eraser' ? "default" : "outline"}
            size="icon"
            onClick={() => setTool('eraser')}
            title="Borracha"
        >
            <Eraser className="h-4 w-4" />
        </Button>
        <Button 
            variant="outline"
            size="icon"
            onClick={handleUndo}
            title="Desfazer"
        >
            <Undo className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-4 border-white shadow-lg bg-white">
        <Stage
            width={500}
            height={500}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            ref={stageRef}
        >
            <Layer>
                <RetinaImage />
            </Layer>
            <Layer>
            {lines.map((line, i) => (
                <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'eraser' ? '#ffffff' : line.color}
                strokeWidth={line.tool === 'eraser' ? 20 : 5}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
                />
            ))}
            </Layer>
        </Stage>
      </div>

      <Button onClick={handleExport} className="w-full max-w-[500px]">
          <Save className="mr-2 h-4 w-4" /> Salvar Desenho no Laudo
      </Button>
    </div>
  );
}
