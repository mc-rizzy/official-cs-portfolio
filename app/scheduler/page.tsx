"use client";
import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/heroSection";


const days = [
    {i: 0, name: "Monday"}, 
    {i: 1, name: "Tuesday"}, 
    {i: 2, name: "Wednesdsay"}, 
    {i: 3, name: "Thursday"}, 
    {i: 4, name: "Friday"}, 
    {i: 5, name: "Saturday"}, 
    {i: 6, name: "Sunday"}, 
]

export default function Page() {
  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);

  const containerPadding = 15;
  const columnWidth = 30;
  const columnGap = 10;
  const selectedDayWidth = 100;

  // Generate hour labels starting at 6 PM (18:00) through 18 hours (72 ticks / 4 ticks per hr)
  const startHour = 18; // 6 PM in 24h format
  const hours = Array.from({ length: 19 }, (_, i) => {
    const hour24 = (startHour + i) % 24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12} ${period}`;
  });

  const gridHeight = `calc(100vh - ${2 * containerPadding}px)`;

  return (
    <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', backgroundColor: '#121212', color: '#fff', overflowX: 'hidden' }}>
      {/* 1. RULER CONTAINER (Full Screen Background Grid & Hour Labels) */}
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
          paddingLeft: '65px', // Reserve space for the hour labels
          display: 'flex',
          gap: `${columnGap}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {days.map((data, idx) => {
          const isSelected = data.i === selectedDay;
          const currentWidth = isSelected ? selectedDayWidth : columnWidth;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(data.i)}
              style={{
                width: `${currentWidth}px`,
                height: gridHeight,
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box',
                transition: 'width 0.2s ease',
                cursor: 'pointer',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}


// Scheduler
// Budgeter
// Resume