'use client';

import React, { useState } from 'react';
import "./block.css";

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
    onDrag?: (newX: number, newY: number, mouseX: number, mouseY: number) => void;
    onResize?: (mouseY: number, newY: number) => void;
	onResizeWidth?: (mouseX: number) => void;
    startDrag?: () => void;
    onChangeName?: (newName: string) => void;
    onChangeDescription?: (newDescription: string) => void;
	onRightClick?: () => void;
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
    color = "rgba(255, 255, 255, 0.08)",
    style,
    onDrag,
    onResize,
	onResizeWidth,
    startDrag,
    onChangeName,
    onChangeDescription,
	onRightClick,
}) => {
    const sizeGradient = Math.max(Math.min(width * height / 73000, 1), 0);

	const editingBox = "bg-white/5 text-slate-100 outline-none w-full mr-2 rounded px-1 resize-none";

	const nameColor = `rgba(255,255,255,${0.3 + 0.5 * sizeGradient})`;
	const editingNameColor = `rgba(255, 255, 255, ${0.5 + 0.5 * sizeGradient})`;
	const descColor = `rgba(255,255,255,${sizeGradient > 0.2 ? 0.7 * sizeGradient : 0})`;
	const editingDescColor = `rgba(255, 255, 255, ${0.7 * sizeGradient})`;
	const sideColor = `rgba(255,255,255,0)`;

    // Track editing modes
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    // Local state for immediate typing responsiveness
    const [localName, setLocalName] = useState(name);
    const [localDesc, setLocalDesc] = useState(description);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent drag initiation if user is clicking inside an input
        if (isEditingName || isEditingDesc) return;

        e.stopPropagation();
        startDrag?.();
        const startX = e.clientX - x;
        const startY = e.clientY - y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            onDrag?.(moveEvent.clientX - startX, moveEvent.clientY - startY, moveEvent.clientX, moveEvent.clientY);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents triggering drag

        const handleMouseMove = (moveEvent: MouseEvent) => {
            onResize?.(moveEvent.clientY+window.scrollY, moveEvent.clientY+window.scrollY - y);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

	const handleResizeStartWidth = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents triggering drag

        const handleMouseMove = (moveEvent: MouseEvent) => {
            onResizeWidth?.(moveEvent.clientX+window.scrollX - x);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleNameSubmit = () => {
        setIsEditingName(false);
        onChangeName?.(localName);
    };

    const handleDescSubmit = () => {
        setIsEditingDesc(false);
        onChangeDescription?.(localDesc);
    };

	const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRightClick?.();
    };

    return (
        <div onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            className={`absolute z-2 text-slate-100 rounded p-2 overflow-hidden text-xs cursor-grab active:cursor-grabbing select-none ${className}`}
            style={{
                backgroundColor: color,
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                ...style,
            }}
        >
            <div className={`flex justify-between ${sizeGradient > 0.3 ? "font-bold" : ""}`}>
                {/* NAME INPUT / DISPLAY */}
                {isEditingName ? (
                    <input
                        type="text"
                        value={localName}
                        autoFocus
                        onChange={(e) => setLocalName(e.target.value)}
                        onBlur={handleNameSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNameSubmit();
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // Prevents dragging while selecting text
                        className={editingBox}
                        style={{ fontSize: `${20 * (0.5 + 0.5 * sizeGradient)}px`, color: editingNameColor }}
                    />
                ) : (
                    <span
                        style={{
                            color: nameColor,
                            fontSize: `${20 * (0.5 + 0.5 * sizeGradient)}px`
                        }}
                        className="truncate clickToEdit cursor-text w-full"
                        onDoubleClick={() => setIsEditingName(true)}
                        // title="Double click to edit"
                    >
                        {localName}
                    </span>
                )}

                <span style={{ color: sideColor, fontSize: `${20 * (0.3 + 0.7 * sizeGradient)}px` }} className="text-slate-400 ml-1 shrink-0">
                    {start} - {end}
                </span>
            </div>

            {/* DESCRIPTION INPUT / DISPLAY */}
            {isEditingDesc ? (
                <textarea
                    value={localDesc}
                    autoFocus
                    onChange={(e) => setLocalDesc(e.target.value)}
                    onBlur={handleDescSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleDescSubmit();
                        }
                    }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevents dragging while selecting text
                    className={`${editingBox} mt-1 h-full`}
                    style={{ fontSize: `${15 * (0.5 + 0.5 * sizeGradient)}px`, color: editingDescColor}}
                    rows={2}
                />
            ) : (
                <p
                    style={{
                        color: descColor,
                        fontSize: `${15 * (0.5 + 0.5 * sizeGradient)}px`
                    }}
                    className="text-slate-300 mt-1 line-clamp-2 cursor-text clickToEdit w-full h-full"
                    onDoubleClick={() => setIsEditingDesc(true)}
                    // title="Double click to edit"
                >
                    {localDesc}
                </p>
            )}

            <div onMouseDown={handleResizeStart} data-hover className="absolute bottom-0 left-0 h-[10%] w-full cursor-s-resize" />
			<div onMouseDown={handleResizeStartWidth} data-hover className="absolute right-0 top-0 w-[10%] h-full cursor-s-resize" />
        </div>
    );
};

export default Block;