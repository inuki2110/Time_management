"use client";

import React from "react";
import { TimeEntry } from "@/types/TimeEntry";
import { format, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Edit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface TimeEntryListProps {
    selectedDate: Date;
    timeEntries: TimeEntry[];
    onDeleteTimeEntry: (id: string) => void;
    isLoading: boolean;
    onEditEntry: (entry: TimeEntry) => void;
    getCategoryBgColor: (name: string) => string;
    getCategoryTextColor: (name: string) => string;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
    selectedDate,
    timeEntries,
    onDeleteTimeEntry,
    isLoading,
    onEditEntry,
    getCategoryBgColor,
    getCategoryTextColor,
}) => {
    
    const filteredEntries = timeEntries.filter((entry) =>
        isSameDay(new Date(entry.date), selectedDate)
    );

    if (isLoading) {
        return (
            <div className="space-y-3 p-1">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        );
    }

    if (filteredEntries.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 text-center text-muted-foreground p-4">
                Không có mục nào cho ngày này.
            </div>
        );
    }

    return (
        <ul className="space-y-3 p-1">
            {filteredEntries.map((entry) => {
                const backgroundColor = getCategoryBgColor(entry.category);
                const textColor = getCategoryTextColor(entry.category);

                return (
                    <li
                        key={entry.id}
                        className="flex items-center gap-3 p-3 rounded-lg shadow-sm"
                        style={{
                            backgroundColor: backgroundColor,
                            color: textColor,
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
    );
};

export default TimeEntryList;