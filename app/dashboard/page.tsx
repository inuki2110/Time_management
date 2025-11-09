"use client";

import React, { useState, useEffect } from "react";
import DayPicker from "@/components/DayPicker";
import TimeTracker from "@/components/TimeTracker";
import TimeEntryList from "@/components/TimeEntryList";
import { TimeEntry } from "@/types/TimeEntry";
import { addDays, subDays, addWeeks, subWeeks, format, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { WeekView } from "@/components/weekly/Calendar";
import CategoryEditor from "@/components/category/CategoryEditor";
import DailyBreakdown from "@/components/category/DailyBreakdown";
import { View } from "react-big-calendar";
import { Category } from "@/types/Category";
import { MyCustomCalendarHeader } from "@/components/weekly/MyCustomCalendarHeader"; 
import { ScheduleView } from "@/components/ScheduleView";

type CalendarView = "day" | "week";

type TimeEntryFromDB = Omit<TimeEntry, 'startTime' | 'endTime' | 'date'> & {
    startTime: string;
    endTime: string;
    date: string; 
};

const DashboardPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<
        { start: Date; end: Date } | undefined
    >(undefined);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]); 
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [currentView, setCurrentView] = useState<CalendarView>("week");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const parseEntriesFromDB = (entries: TimeEntryFromDB[]): TimeEntry[] => {
        return entries.map(entry => ({
            ...entry,
            startTime: new Date(entry.startTime),
            endTime: new Date(entry.endTime),
            date: entry.date, 
        }));
    };

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/categories', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                console.error("Tải danh mục thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const loadTimeEntries = async () => {
         try {
            const response = await fetch('/api/time-entries', { cache: 'no-store' });
            if (response.ok) {
                const data: TimeEntryFromDB[] = await response.json();
                setTimeEntries(parseEntriesFromDB(data)); 
            } else {
                console.error("Tải Time Entries thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi tải Time Entries:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                loadTimeEntries(),
                loadCategories()
            ]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) setSelectedDate(date);
    };

    const handleSaveEntry = async (entry: TimeEntry) => {
        const isNewEntry = !timeEntries.some((e) => e.id === entry.id);

        try {
            const response = await fetch('/api/time-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry), 
            });

            if (!response.ok) {
                throw new Error('Lưu thất bại');
            }

            const savedEntry: TimeEntryFromDB = await response.json();
            
            const formattedEntry: TimeEntry = {
                ...savedEntry,
                startTime: new Date(savedEntry.startTime),
                endTime: new Date(savedEntry.endTime),
                date: savedEntry.date, 
            };

            if (isNewEntry) {
                setTimeEntries((prev) => [...prev, formattedEntry]);
            } else {
                setTimeEntries((prev) =>
                    prev.map((e) => (e.id === formattedEntry.id ? formattedEntry : e))
                );
            }

            setIsDialogOpen(false);
            setEditingEntry(null);

        } catch (error) {
            console.error("Lỗi khi lưu entry:", error);
            alert("Lỗi: Không thể lưu mục thời gian.");
        }
    };

    const handleDeleteTimeEntry = async (entryId: string) => {
        if (!confirm("Bạn có chắc muốn xóa mục này?")) return;
        try {
            const response = await fetch(`/api/time-entries/${entryId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Xóa thất bại');
            setTimeEntries((prev) => prev.filter((e) => e.id !== entryId));
        } catch (error) {
            console.error("Lỗi khi xóa entry:", error);
            alert("Lỗi: Không thể xóa mục thời gian.");
        }
    };

    const handleTimeEntryDrop = async (updatedEntry: { id: string; start: Date; end: Date }) => {
        const { id, start, end } = updatedEntry;

        const newDateString = `${start.getFullYear()}-${(start.getMonth() + 1)
            .toString().padStart(2, '0')}-${start.getDate().toString().padStart(2,'0')}`;
        
        setTimeEntries((prev) =>
            prev.map((e) =>
                e.id === id ? { ...e, startTime: start, endTime: end, date: newDateString } : e
            )
        );

        try {
            const response = await fetch(`/api/time-entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    date: newDateString, 
                }),
            });

            if (!response.ok) {
                throw new Error('Cập nhật (kéo-thả) thất bại');
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật (kéo-thả) entry:", error);
            alert("Lỗi: Không thể lưu thay đổi khi kéo-thả.");
            loadTimeEntries(); 
        }
    };

    const handleSelectSlot = (slotInfo: any) => {
        const { start, end } = slotInfo;
        setSelectedSlot({ start, end });
        setEditingEntry(null);
        setIsDialogOpen(true);
    };

    const handleStartEdit = (entry: TimeEntry) => {
        setEditingEntry(entry);
        setSelectedSlot(undefined);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingEntry(null);
            setSelectedSlot(undefined);
        }
    };

    const handleCategoriesUpdated = (newCategories: Category[]) => {
        const newNames = newCategories.map((c) => c.name);
        const deletedNames = categories
            .filter((c) => !newNames.includes(c.name))
            .map((c) => c.name);

        if (deletedNames.length > 0) {
            console.warn("Cần cập nhật API để xóa category khỏi time entries");
            setTimeEntries((prev) =>
                prev.map((entry) =>
                    deletedNames.includes(entry.category)
                        ? { ...entry, category: "" }
                        : entry
                )
            );
        }
        setCategories(newCategories);
    };

    const getCategoryBgColor = (name: string): string => {
        const cat = categories.find((c) => c.name === name);
        return cat ? cat.color : "#333333";
    };

    const getCategoryTextColor = (name: string): string => {
        const cat = categories.find((c) => c.name === name);
        return cat ? cat.textColor : "#FFFFFF";
    };

    const goToToday = () => setSelectedDate(new Date());
    const goToNext = () =>
        setSelectedDate(
            currentView === "day"
                ? addDays(selectedDate, 1)
                : addWeeks(selectedDate, 1)
        );
    const goToPrevious = () =>
        setSelectedDate(
            currentView === "day"
                ? subDays(selectedDate, 1)
                : subWeeks(selectedDate, 1)
        );

    const getHeaderTitle = () => {
        if (currentView === "day") {
            return format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi });
        }
        return format(selectedDate, "MMMM, yyyy", { locale: vi });
    };

    const handleNavigate = (newDate: Date) => {
        setSelectedDate(newDate);
    };

    const handleViewChange = (view: View) => {
        if (view === "day" || view === "week") {
            setCurrentView(view);
        }
    };
    
    return (
        <div className="flex flex-col gap-3 h-full overflow-hidden px-6">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingEntry ? "Chỉnh sửa mục" : "Thêm mục mới"}
                        </DialogTitle>
                        <div className="flex flex-col gap-2">
                            <TimeTracker
                                selectedDate={selectedDate} 
                                onSaveEntry={handleSaveEntry}
                                onClose={() => handleDialogClose(false)}
                                selectedSlot={selectedSlot}
                                entryToEdit={editingEntry}
                                categories={categories}
                            />
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4 py-2">
                <Button variant="outline" onClick={goToToday}>
                    Hôm nay
                </Button>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={goToPrevious}>
                        <ChevronLeft size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNext}>
                        <ChevronRight size={20} />
                    </Button>
                </div>
                <h2 className="text-xl font-semibold">{getHeaderTitle()}</h2>
                <div className="flex-grow" />
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <Button
                        size="sm"
                        variant={currentView === "day" ? "secondary" : "ghost"}
                        onClick={() => setCurrentView("day")}
                    >
                        Ngày
                    </Button>
                    <Button
                        size="sm"
                        variant={currentView === "week" ? "secondary" : "ghost"}
                        onClick={() => setCurrentView("week")}
                    >
                        Tuần
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <CalendarIcon size={20} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-1">
                        <DayPicker selected={selectedDate} onSelect={handleDateSelect} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex gap-4 justify-between h-full overflow-hidden">
                
                <div className="w-1/2 overflow-hidden h-full space-y-9 flex flex-col">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {!isMounted
                                ? "Tổng quan Ngày"
                                : (currentView === 'week' ? "Lịch biểu" : "Tổng quan Ngày")
                            }
                        </h2>
                        <CategoryEditor
                            categories={categories}
                            onCategoriesUpdated={handleCategoriesUpdated}
                        />
                    </div>

                    {currentView === 'week' ? (
                        <ScheduleView
                            timeEntries={timeEntries}
                            selectedDate={selectedDate}
                            onEditEntry={handleStartEdit} 
                            onDeleteTimeEntry={handleDeleteTimeEntry} 
                            getCategoryBgColor={getCategoryBgColor}
                            getCategoryTextColor={getCategoryTextColor}
                        />
                    ) : (
                        <>
                            <DailyBreakdown
                                selectedDate={selectedDate}
                                timeEntries={timeEntries}
                                categories={categories} 
                            />

                            <div className="rounded-xl overflow-hidden">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-24 text-center text-muted-foreground p-4">
                                        Đang tải dữ liệu...
                                    </div>
                                ) : (
                                    <TimeEntryList
                                        selectedDate={selectedDate}
                                        timeEntries={timeEntries}
                                        onDeleteTimeEntry={handleDeleteTimeEntry}
                                        isLoading={isLoading}
                                        onEditEntry={handleStartEdit}
                                        getCategoryBgColor={getCategoryBgColor} 
                                        getCategoryTextColor={getCategoryTextColor} 
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-full h-full bg-muted rounded-xl flex flex-col overflow-hidden">
                    <MyCustomCalendarHeader
                        currentView={currentView}
                        selectedDate={selectedDate}
                        onNavigate={handleNavigate}
                        onViewChange={handleViewChange}
                    />
                    <div className="flex-1 overflow-y-auto">
                        <WeekView
                            getCategoryBgColor={getCategoryBgColor}
                            getCategoryTextColor={getCategoryTextColor}
                            timeEntries={timeEntries}
                            onSelectSlot={handleSelectSlot}
                            selectedDate={selectedDate}
                            onTimeEntriesChange={handleTimeEntryDrop} 
                            onDoubleClickEvent={handleStartEdit}
                            view={currentView}
                            onViewChange={handleViewChange}
                            onNavigate={handleNavigate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;