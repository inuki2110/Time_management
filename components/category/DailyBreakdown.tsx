// components/category/DailyBreakdown.tsx
"use client";
import React, { useState, useEffect } from "react";
import { TimeEntry } from "@/types/TimeEntry";
import { differenceInMinutes, isSameDay } from "date-fns"; 
import { Toggle } from "@/components/ui/toggle";
import { Category } from "@/types/Category"; 

interface DailyBreakdownProps {
    selectedDate: Date;
    timeEntries: TimeEntry[];
    categories: Category[]; 
}

interface CategoryBreakdown {
    category: string;
    duration: number;
    enabled: boolean;
}

const DailyBreakdown: React.FC<DailyBreakdownProps> = ({
    selectedDate,
    timeEntries,
    categories, 
}) => {
    const [categoryBreakdowns, setCategoryBreakdowns] = useState<
        CategoryBreakdown[]
    >([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const filteredEntries = timeEntries.filter(
            (entry) => isSameDay(new Date(entry.date), selectedDate)
        );
        const breakdowns = filteredEntries.reduce((acc, entry) => {
            const duration =
                differenceInMinutes(
                    new Date(entry.endTime),
                    new Date(entry.startTime)
                ) / 60;
            
            const categoryName = entry.category || "Không có danh mục";

            const existingCategory = acc.find(
                (item) => item.category === categoryName
            );

            if (existingCategory) {
                existingCategory.duration += duration;
            } else {
                acc.push({ category: categoryName, duration, enabled: true });
            }

            return acc;
        }, [] as CategoryBreakdown[]);

        setCategoryBreakdowns(breakdowns);
    }, [selectedDate, timeEntries]); 

    useEffect(() => {
        const newTotal = categoryBreakdowns
            .filter((breakdown) => breakdown.enabled)
            .reduce((sum, breakdown) => sum + breakdown.duration, 0);
        setTotal(newTotal);
    }, [categoryBreakdowns]);

    const toggleCategory = (category: string) => {
        setCategoryBreakdowns((prevBreakdowns) =>
            prevBreakdowns.map((breakdown) =>
                breakdown.category === category
                    ? { ...breakdown, enabled: !breakdown.enabled }
                    : breakdown
            )
        );
    };
    const getCategoryColor = (categoryName: string): string => {
        if (categoryName === "Không có danh mục") {
            return "#555555"; 
        }
        const category = categories.find(
            (cat: Category) => cat.name === categoryName
        );
        return category ? category.color : "#555555";
    };
    // === HẾT SỬA LỖI ===

    const formatDuration = (duration: number): string => {
        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);

        if (minutes === 0) {
            return `${hours} giờ`;
        } else {
            return `${hours} giờ ${minutes} phút`;
        }
    };

    return (
        <div className="p-4 bg-card rounded-lg shadow">
            
            {categoryBreakdowns.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Không có mục thời gian nào cho ngày đã chọn.
                </p>
            ) : (
                categoryBreakdowns.map(({ category, duration, enabled }) => (
                    <div
                        key={category}
                        className="flex items-center justify-between mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <Toggle
                                pressed={enabled}
                                onPressedChange={() => toggleCategory(category)}
                                aria-label={`Toggle ${category}`}
                                className={`shrink-0 px-6`}
                                style={{
                                    backgroundColor: enabled
                                        ? getCategoryColor(category)
                                        : "transparent",
                                }}
                            >
                                {category}
                            </Toggle>
                        </div>
                        <span>{formatDuration(duration)}</span>
                    </div>
                ))
            )}
            
            <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatDuration(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default DailyBreakdown;