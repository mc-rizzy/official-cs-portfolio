'use client';

import React, { useEffect, useRef, useState } from 'react';
import "./block.css"

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
	onResize?: (mouseY: number) => void;
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
	onResize,
	startDrag,
}) => {
	const sizeGradient = Math.max(Math.min(width * height / 73000, 1), 0);

	const handleMouseDown = (e: React.MouseEvent) => {
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
            onResize?.(moveEvent.clientY);
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
				<span style={{
					opacity: 0.1+0.5*sizeGradient,
					fontSize: `${20 * (0.5+0.5*sizeGradient)}px`
					
				}} className="truncate">{name}</span>
				<span style={{fontSize: `${20 * (0.3+0.7*sizeGradient)}px`}} className=" text-slate-400 ml-1">{start} - {end}</span>
			</div>
			<p style={{
				opacity: sizeGradient > 0.2? 0.7*sizeGradient : 0,
				fontSize: `${15 * (0.5+0.5*sizeGradient)}px`
			}} className="text-slate-300 mt-1 line-clamp-2">{description}</p>
			<div onMouseDown={handleResizeStart} data-hover className="absolute bottom-0 left-0 h-[10%] w-full" />
		</div>
	);
};

export default Block;