"use client";

import React from "react";
import { TimeEntry } from "@/types/TimeEntry";
import { format, isSameMonth, startOfDay, compareAsc } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "./ui/button";
import { Trash2, Edit } from "lucide-react";

interface ScheduleViewProps {
    timeEntries: TimeEntry[];
    selectedDate: Date;
    onEditEntry: (entry: TimeEntry) => void;
    onDeleteTimeEntry: (id: string) => void;
    getCategoryBgColor: (categoryName: string) => string;
    getCategoryTextColor: (categoryName: string) => string;
}

type GroupedEntries = {
    [key: string]: TimeEntry[];
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
    timeEntries,
    selectedDate,
    onEditEntry,
    onDeleteTimeEntry,
    getCategoryBgColor,
    getCategoryTextColor,
}) => {
    
    const monthlyEntries = timeEntries
        .filter((entry) =>
            isSameMonth(new Date(entry.date), selectedDate)
        )
        .sort((a, b) =>
            compareAsc(new Date(a.date), new Date(b.date))
        );

    const groupedEntries = monthlyEntries.reduce<GroupedEntries>((acc, entry) => {
        const dayKey = format(startOfDay(new Date(entry.date)), "EEEE, dd/MM/yyyy", {
            locale: vi,
        });

        if (!acc[dayKey]) {
            acc[dayKey] = [];
        }
        acc[dayKey].push(entry);
        return acc;
    }, {});

    const dayKeys = Object.keys(groupedEntries);

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {dayKeys.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Không có lịch biểu nào cho tháng này.
                </div>
            ) : (
                dayKeys.map((day) => (
                    <div key={day} className="mb-4">
                        <h4 className="text-sm font-semibold text-primary sticky top-0 bg-background/95 backdrop-blur-sm py-2">
                            {day}
                        </h4>
                        <ul className="flex flex-col gap-2 mt-2">
                            {groupedEntries[day].map((entry) => {
                                const backgroundColor = getCategoryBgColor(entry.category || "");
                                const textColor = getCategoryTextColor(entry.category || "");

                                return (
                                    <li
                                        key={entry.id}
                                        className="flex items-center gap-3 p-3 rounded-lg shadow-sm"
                                        style={{
                                            backgroundColor: backgroundColor,
                                            color: textColor 
                                        }}
                                    >
                                            <div className="flex flex-col text-sm text-right font-medium">
                                            <span>{format(new Date(entry.startTime), "HH:mm")}</span>
                                            <span style={{ opacity: 0.75 }}>
                                                {format(new Date(entry.endTime), "HH:mm")}
                                            </span>
                                            </div>
                                        
                                        <div 
                                            className="w-px h-8" 
                                            style={{ backgroundColor: textColor, opacity: 0.3 }} 
                                        />
                                        
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate">
                                                {entry.category || "(Không có danh mục)"}
                                            </p>
                                            <p className="text-sm truncate" style={{ opacity: 0.75 }}>
                                                {entry.description || "..."}
                                            </p>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                style={{ color: textColor }} 
                                                className="hover:bg-black/20" 
                                                onClick={() => onEditEntry(entry)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                style={{ color: textColor }} 
                                                className="hover:bg-black/20" 
                                                onClick={() => onDeleteTimeEntry(entry.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
};

export default ScheduleView;