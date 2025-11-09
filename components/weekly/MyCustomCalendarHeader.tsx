"use client";

import React from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

const GUTTER_WIDTH_PX = "48.8px"; 

interface MyCustomCalendarHeaderProps {
    currentView: "day" | "week";
    selectedDate: Date;
    onViewChange: (view: "day" | "week") => void;
    onNavigate: (date: Date) => void;
}

const getWeekDays = (date: Date): Date[] => {
    const start = startOfWeek(date, { 
        locale: vi,
        weekStartsOn: 1 
    }); 
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const MyCustomCalendarHeader: React.FC<MyCustomCalendarHeaderProps> = ({
    currentView,
    selectedDate,
    onViewChange,
    onNavigate,
}) => {
    const today = new Date();
    const weekDays = getWeekDays(selectedDate);

    const handleHeaderClick = (day: Date) => {
        onNavigate(day); 
        onViewChange("day"); 
    };

    const renderHeaderCell = (date: Date, isClickable: boolean) => {
        const dayOfWeek = format(date, "eee", { locale: vi }); 
        const dayOfMonth = format(date, "d");
        const isToday = isSameDay(date, today);

        const dayOfMonthClasses = `
            text-2xl flex items-center justify-center mx-auto
            w-9 h-9 font-bold
            ${isToday ? "bg-primary text-primary-foreground rounded-full" : ""}
        `;

        const dayOfWeekClasses = `
            text-xs uppercase mb-1
            ${isToday 
                ? "text-primary" 
                : (currentView === "week" 
                    ? "text-muted-foreground" 
                    : "text-foreground") 
            }
        `;

        const headerCellClasses = `
            flex-1 h-auto flex-col py-1 px-0 text-center rounded-md
            transition-colors duration-150
            ${isClickable 
                ? "cursor-pointer hover:bg-accent" 
                : "cursor-default" 
            }
        `;

        return (
            <div
                key={date.toISOString()}
                className={headerCellClasses}
                onClick={() => isClickable && handleHeaderClick(date)}
            >
                <div className={dayOfWeekClasses}>{dayOfWeek}</div>
                <div className={dayOfMonthClasses}>{dayOfMonth}</div>
            </div>
        );
    };

    return (
        <div className="flex w-full border-b border-border" style={{ minHeight: "70px" }}>
            
            <div
                className="border-r border-border"
                style={{ width: GUTTER_WIDTH_PX, flexShrink: 0 }}
            ></div>
            
            <div className="flex flex-1">
                {currentView === "week" &&
                    weekDays.map((day) => renderHeaderCell(day, true))}
                
                {currentView === "day" && (
                    <>
                        {renderHeaderCell(selectedDate, false)}
                        <div className="flex-[6]"></div>
                    </>
                )}
            </div>
        </div>
    );
};