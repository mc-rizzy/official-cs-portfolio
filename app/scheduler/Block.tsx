'use client';

import React from 'react';

export interface BlockProps {
  x: number;
  y: number;
  width: number;
  height: number;
  start: string | number;
  end: string | number;
  name: string;
  description: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  onDrag?: (newX: number, newY: number) => void;
  startDrag?: () => void;
}

export const Block: React.FC<BlockProps> = ({
  x,
  y,
  width,
  height,
  start,
  end,
  name,
  description,
  className = '',
  color = "rgba(0, 255, 0, 0.2)",
  style,
  onDrag,
  startDrag,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDrag?.();
    const startX = e.clientX - x;
    const startY = e.clientY - y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onDrag?.(moveEvent.clientX - startX, moveEvent.clientY - startY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      data-hover
      onMouseDown={handleMouseDown}
      className={`absolute z-2 border border-slate-700 text-slate-100 rounded p-2 overflow-hidden text-xs cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        backgroundColor: color,
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
    >
      <div className="flex justify-between font-bold">
        <span className="truncate">{name}</span>
        <span className="text-[10px] text-slate-400 ml-1">{start} - {end}</span>
      </div>
      <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">{description}</p>
    </div>
  );
};

export default Block;