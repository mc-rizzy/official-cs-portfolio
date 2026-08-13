"use client";
import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/heroSection";
import Blocks, { Block } from "./Block";
import CursorWrapper from "../components/cursorWrapper";



export default function Page() {
    const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
    const [blocks, setBlocks] = useState<any[]>([]);
    const days = useRef<any[]>([
        {i: 0, name: "Monday"}, 
        {i: 1, name: "Tuesday"}, 
        {i: 2, name: "Wednesdsay"}, 
        {i: 3, name: "Thursday"}, 
        {i: 4, name: "Friday"}, 
        {i: 5, name: "Saturday"}, 
        {i: 6, name: "Sunday"}, 
    ]);

    const containerPadding = 15;
    const columnWidth = 30;
    const columnGap = 10;
    const selectedDayWidth = 100;
    const rulerLeftOffset = 65;

    // Generate hour labels starting at 6 PM (18:00) through 18 hours (72 ticks / 4 ticks per hr)
    const startHour = 18; // 6 PM in 24h format
    const hours = Array.from({ length: 19 }, (_, i) => {
        const hour24 = (startHour + i) % 24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12} ${period}`;
    });

    const gridHeight = `calc(100vh - ${2 * containerPadding}px)`;

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        let newBlock = {
            width: 100,
            height: 100,
            x: e.clientX,
            y: e.clientY,
            start: "",
            end: "",
            name: "Blank",
            description: "",
            color: ""
        }
        setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    };

    return (<>
        <CursorWrapper />
        <div onContextMenu={handleContextMenu} style={{ cursor: "none", position: 'relative', width: '100vw', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', overflowX: 'hidden' }}>
            {blocks.map((data: any, idx: any)=>{
                return <Block
                    key={idx}
                    width={data.width}
                    height={data.height}
                    x={data.x}
                    y={data.y}
                    start={data.start}
                    end={data.end}
                    name={data.name}
                    description={data.description}
                    onDrag={(newX, newY) => {
                        let calcY = (window.innerHeight - 2*containerPadding) / 72;
                        const activeDay = days.current.find(
                            (day) => newX >= day.x && newX < day.x + day.width
                        );

                        const snapX = activeDay ? activeDay.x : newX;
                        const targetWidth = activeDay ? activeDay.width : data.width;

                        setBlocks((prev) =>
                            prev.map((b, i) =>
                                i === idx
                                ? {
                                    ...b,
                                    x: Math.max(rulerLeftOffset, snapX),
                                    width: targetWidth,
                                    y:
                                        containerPadding +
                                        Math.round(Math.max(0, newY) / calcY) * calcY,
                                    }
                                : b
                            )
                        );
                    }}
                    startDrag={() => {
                        const container = document.getElementById("daysContainer");
                        if (!container) return;

                        const updatedDays = days.current.map((day) => {
                        const el = container.querySelector(
                            `[data-index="${day.i}"]`
                        ) as HTMLElement;
                        if (!el) return day;

                        const rect = el.getBoundingClientRect();
                        return {
                            ...day,
                            x: rect.left,
                            width: rect.width,
                        };
                        });

                        days.current = updatedDays;
                    }}
                />
            })}
            <div
                style={{
                position: 'absolute',
                top: `${containerPadding}px`,
                left: 0,
                right: 0,
                height: gridHeight,
                display: 'grid',
                gridTemplateRows: 'repeat(72, 1fr)',
                pointerEvents: 'none', // Allows clicking through to columns underneath
                zIndex: 0,             // Sits behind <Blocks />
                }}
            >
                {Array.from({ length: 72 }).map((_, cellIdx) => {
                const isHourTick = cellIdx % 4 === 0;
                const hourIndex = cellIdx / 4;

                return (
                    <div
                        key={cellIdx}
                        style={{
                            position: 'relative',
                            width: '100%',
                            borderTop: isHourTick
                            ? '1px solid rgba(255, 255, 255, 0.4)'
                            : '1px dashed rgba(255, 255, 255, 0.1)',
                            boxSizing: 'border-box',
                        }}
                    >
                    {/* Hour Label on the left side for every 4th tick */}
                    {isHourTick && (
                        <span
                        style={{
                            position: 'absolute',
                            top: '-7px',
                            left: '8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: 'monospace',
                            backgroundColor: '#121212',
                            paddingRight: '4px',
                        }}
                        >
                        {hours[hourIndex]}
                        </span>
                    )}
                    </div>
                );
                })}
            </div>

            {/* 2. COLUMNS CONTAINER (Offset to clear left ruler text) */}
            <div
                style={{
                    paddingTop: `${containerPadding}px`,
                    paddingBottom: `${containerPadding}px`,
                    paddingLeft: `${rulerLeftOffset}px`, // Reserve space for the hour labels
                    display: 'flex',
                    gap: `${columnGap}px`,
                    position: 'relative',
                    zIndex: 1,
                }}
                id="daysContainer"
            >
                {days.current.map((data, idx) => {
                    const isSelected = data.i === selectedDay;
                    const currentWidth = isSelected ? selectedDayWidth : columnWidth;

                    return (
                        <div
                            key={idx}
                            data-index={idx}
                            onClick={() => setSelectedDay(data.i)}
                            style={{
                                width: `${currentWidth}px`,
                                height: gridHeight,
                                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                                boxSizing: 'border-box',
                                transition: 'width 0.2s ease',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    </>);
}


// Scheduler
// Budgeter
// Resume