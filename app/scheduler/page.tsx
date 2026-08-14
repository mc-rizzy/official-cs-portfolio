"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HeroSection from "../components/heroSection";
import Blocks, { Block } from "./Block";
import CursorWrapper from "../components/cursorWrapper";
import next from "next";



export default function Page() {
    const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
    const [blocks, setBlocks] = useState<any[]>([]);
    const [dayBounds, setDayBounds] = useState<{ [key: number]: { x: number; width: number } }>({});
    const [updateBlockInterval, setUpdateBlockInterval] = useState<ReturnType<typeof setInterval> | null>(null);
    const days = useRef<any[]>([
        {i: 0, name: "Monday"}, 
        {i: 1, name: "Tuesday"}, 
        {i: 2, name: "Wednesdsay"}, 
        {i: 3, name: "Thursday"}, 
        {i: 4, name: "Friday"}, 
        {i: 5, name: "Saturday"}, 
        {i: 6, name: "Sunday"}, 
    ]);
    const daysContainerRef = useRef<HTMLDivElement>(null);
    const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const containerPadding = 15;
    const columnWidth = 30;
    const columnGap = 10;
    const selectedDayWidth = 100;
    const rulerLeftOffset = 65;
    const columnWidthTransition = 'width 0.2s ease'

    const selectedColumnBackgroundColor = "rgba(255, 255, 255, 0.1)";
    const columnBackgroundColor = "rgba(255, 255, 255, 0.05)";
    const columnBorderColor = "rgba(255, 255, 255, 0)";
    const timeColor = "rgba(255, 255, 255, 0.33)";
    const rulerColor1 = "1px solid rgba(255, 255, 255, 0.15)";
    const rulerColor2 = "1px dashed rgba(255, 255, 255, 0.1)";

    const [zoomData, setZoomData] = useState({
        minScale: 1,
        maxScale: 5,

        transitionWidth: columnWidthTransition,
        columnScale: 1,
        scale: 1,
        gridHeight: `calc(${100}vh - ${2 * containerPadding}px)`,
    });

    // Generate hour labels starting at 6 PM (18:00) through 18 hours (72 ticks / 4 ticks per hr)
    const startHour = 18; // 6 PM in 24h format
    const hours = Array.from({ length: 19 }, (_, i) => {
        const hour24 = (startHour + i) % 24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12} ${period}`;
    });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        let newBlock = {
            width: 100,
            height: 1,
            day: "",
            x: e.clientX,
            y: e.clientY,
            start: "",
            end: "",
            name: "Blank",
            description: "Blank",
            color: "",
        }
        setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    };

    const updateBlocks = () => {
        if (daysContainerRef.current){
            const updatedDays = days.current.map((day) => {
                const el = daysContainerRef.current?.querySelector(
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
        }
        
        return(
            blocks.map((data: any, idx: any)=>{
                if (!daysContainerRef.current) return;
                let verticalUnit = (daysContainerRef.current.clientHeight - 2*containerPadding) / 72;
                const calculatedHeight = (data.start !== "" && data.end !== "")
                    ? Math.max((data.end - data.start) * verticalUnit * 4, 15) // enforce min height
                    : data.height * verticalUnit * 4;

                return <Block
                    key={idx}
                    width={data.day && dayBounds[data.day]? dayBounds[data.day].width : data.width}
                    height={calculatedHeight}
                    x={data.day && dayBounds[data.day]? dayBounds[data.day].x : data.x}
                    y={data.start? ((data.start-6)*4*verticalUnit)+containerPadding : data.y}
                    start={data.start}
                    end={data.end}
                    name={data.name}
                    description={data.description}
                    onDrag={(newX, newY, mouseX, mouseY) => {
                        const activeDay = days.current.find(
                            (day) => mouseX >= day.x && mouseX < day.x + day.width
                        );

                        const snapX = activeDay ? activeDay.x : newX;
                        const targetWidth = activeDay ? activeDay.width : data.width;
                        const snappedStart = Math.round(Math.max(0, newY - containerPadding) / verticalUnit);
                        const startTime = 6 + snappedStart / 4;

                        setBlocks((prev) =>
                            prev.map((b, i) =>
                                i === idx
                                ? {
                                    ...b,
                                    start: startTime,
                                    end: startTime + data.height,
                                    x: Math.max(rulerLeftOffset, snapX),
                                    width: targetWidth,
                                    day: activeDay?.i,
                                    y: containerPadding + snappedStart * verticalUnit,
                                    }
                                : b
                            )
                        );
                    }}
                    onResize={(mouseY) => {
                        const snappedEnd = Math.round(Math.max(0, mouseY - containerPadding) / verticalUnit);
                        const endTime = 6 + snappedEnd / 4;
                        setBlocks((prev) =>
                            prev.map((b, i) =>
                                i === idx
                                    ? {
                                          ...b,
                                          end: endTime,
                                          height: endTime - data.start
                                      }
                                    : b
                            )
                        );
                    }}
                    startDrag={() => {}}
                />
            })
        );
    }

    const handleWheel = (e: WheelEvent) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        if (wheelTimeoutRef.current) {clearTimeout(wheelTimeoutRef.current);}

        const zoomFactor = Math.exp(-e.deltaY * 0.01);
        const widthZoomFactor = Math.exp(-e.deltaY * 0.02);

        setZoomData((prev) => {
            const nextScale = Math.min(
                prev.maxScale,
                Math.max(prev.minScale, prev.scale * zoomFactor)
            );
            const nextWidth = Math.min(
                prev.maxScale,
                Math.max(prev.minScale, prev.columnScale * widthZoomFactor)
            );

            return {
                ...prev,
                transitionWidth: "",
                columnScale: nextWidth,
                scale: nextScale,
                gridHeight: `calc(${nextScale * 100}vh - ${2 * containerPadding}px)`
            };
        });
        updateBlocks();
        wheelTimeoutRef.current = setTimeout(() => {    updateBlocks();   }, 150);
    };

    useLayoutEffect(() => {
        if (!daysContainerRef.current) return;

        const updateBounds = () => {
            const newBounds: { [key: number]: { x: number; width: number } } = {};

            days.current.forEach((day) => {
            const el = daysContainerRef.current?.querySelector(
                `[data-index="${day.i}"]`
            ) as HTMLElement;

            if (el) {
                const rect = el.getBoundingClientRect();
                newBounds[day.i] = { x: rect.left, width: rect.width };
            }
            });

            setDayBounds(newBounds);
        };

        updateBounds();

        const observer = new ResizeObserver(() => { updateBounds(); });

        const columns = daysContainerRef.current.querySelectorAll('[data-index]');
        columns.forEach((col) => observer.observe(col));

        window.addEventListener('resize', updateBounds);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateBounds);
        };
    }, [selectedDay, zoomData.columnScale]); // Re-attach when column setup or scale changes


    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
            if (wheelTimeoutRef.current) {  clearTimeout(wheelTimeoutRef.current);  }
        };
    }, []);

    return (<>
        <CursorWrapper />
        <div onContextMenu={handleContextMenu} style={{ touchAction: "none", cursor: "none", position: 'relative', width: '100vw', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', overflowX: 'hidden' }}>
            {updateBlocks()}
            <div
                style={{
                position: 'absolute',
                top: `${containerPadding}px`,
                left: 0,
                right: 0,
                height: zoomData.gridHeight,
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
                            ? rulerColor1
                            : rulerColor2,
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
                            color: timeColor,
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
                ref={daysContainerRef}
            >
                {days.current.map((data, idx) => {
                    const isSelected = data.i === selectedDay;
                    const currentWidth = (isSelected ? selectedDayWidth : columnWidth) * zoomData.columnScale;

                    return (
                        <div
                            key={idx}
                            data-index={idx}
                            onClick={() => {
                                setSelectedDay(data.i);
                                setZoomData((prev) => {
                                    return {
                                        ...prev,
                                        transitionWidth: columnWidthTransition,
                                    }
                                })
                            }}
                            style={{
                                width: `${currentWidth}px`,
                                height: zoomData.gridHeight,
                                backgroundColor: isSelected ? selectedColumnBackgroundColor : columnBackgroundColor,
                                borderLeft: `1px solid ${columnBorderColor}`,
                                borderRight: `1px solid ${columnBorderColor}`,
                                boxSizing: 'border-box',
                                transition: zoomData.transitionWidth,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    </>);
}


// Scheduler
// change block names, colors, zoom, save, polish

// Budgeter

// Resume