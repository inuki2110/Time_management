"use client";

import React, { useState, useEffect } from "react";
import {
    format,
    startOfDay,
    addMinutes,
    setHours,
    setMinutes,
    addHours,
} from "date-fns";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { TimeEntry } from "@/types/TimeEntry";
import { Category } from "@/types/Category";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

interface TimeTrackerProps {
    selectedDate: Date;
    onClose: () => void;
    selectedSlot?: { start: Date; end: Date };
    onSaveEntry: (entry: TimeEntry) => void; 
    entryToEdit?: TimeEntry | null; 
    categories: Category[]; 
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
    selectedDate,
    onClose,
    selectedSlot,
    onSaveEntry,
    entryToEdit,
    categories,
}) => {
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState<Date>(() => new Date()); 
    const [endTime, setEndTime] = useState<Date>(() => new Date());

    useEffect(() => {
        const baseDate = startOfDay(selectedDate);

        if (entryToEdit) {
            setCurrentId(entryToEdit.id);
            setCategory(entryToEdit.category);
            setDescription(entryToEdit.description || "");
            setStartTime(new Date(entryToEdit.startTime));
            setEndTime(new Date(entryToEdit.endTime));
        } else if (selectedSlot) {
            setCurrentId(null);
            setCategory("");
            setDescription("");
            setStartTime(selectedSlot.start);
            setEndTime(selectedSlot.end);
        } else {
            setCurrentId(null);
            setCategory("");
            setDescription("");
            const now = new Date();
            const newStart = setHours(setMinutes(baseDate, now.getMinutes()), now.getHours());
            setStartTime(newStart);
            setEndTime(addHours(newStart, 1));
        }
    }, [selectedDate, selectedSlot, entryToEdit]); 

    const handleStartTimeChange = (value: string) => {
        const [hours, minutes] = value.split(":");
        const newStartTime = setHours(
            setMinutes(startOfDay(selectedDate), parseInt(minutes)),
            parseInt(hours)
        );
        setStartTime(newStartTime);
    };

    const handleEndTimeChange = (value: string) => {
        const [hours, minutes] = value.split(":");
        const newEndTime = setHours(
            setMinutes(startOfDay(selectedDate), parseInt(minutes)),
            parseInt(hours)
        );
        setEndTime(newEndTime);
    };

    const generateTimeOptions = () => {
        const startOfCorrectDay = startOfDay(selectedDate);
        let currentTime = startOfCorrectDay;
        const options = [];
        while (currentTime < addHours(startOfCorrectDay, 24)) {
            options.push(
                <SelectItem
                    key={currentTime.toISOString()}
                    value={format(currentTime, "HH:mm")}
                >
                    {format(currentTime, "HH:mm")}
                </SelectItem>
            );
            currentTime = addMinutes(currentTime, 15);
        }
        return options;
    };
    
    const handleSaveTimeEntry = () => {
        const entryId = currentId ? currentId : uuidv4(); 
        const entryToSave: TimeEntry = {
            id: entryId,
            category,
            description,
            startTime: startTime,
            endTime: endTime,
            date: `${startTime.getFullYear()}-${(startTime.getMonth() + 1)
                .toString().padStart(2, '0')}-${startTime.getDate().toString().padStart(2,'0')}`,
        };
        onSaveEntry(entryToSave);
        onClose(); 
    };


    const calculateTotalHours = (start: Date, end: Date) => {
        if (!start || !end) return "0 giờ"; 
        const duration = moment.duration(moment(end).diff(moment(start)));
        const hours = duration.hours();
        const minutes = duration.minutes();
        if (minutes === 0) {
            return `${hours} giờ`;
        } else {
            return `${hours} giờ ${minutes} phút`;
        }
    };

    return (
        <div>
            <div className="flex gap-2 justify-start">
                <div className="w-full">
                    <Label htmlFor="startTime">Bắt đầu</Label>
                    <Select
                        onValueChange={handleStartTimeChange}
                        value={format(startTime, "HH:mm")}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn giờ bắt đầu">
                                {format(startTime, "HH:mm")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>{generateTimeOptions()}</SelectContent>
                    </Select>
                </div>
                <div className="w-full">
                    <Label htmlFor="endTime">Kết thúc</Label>
                    <Select
                        onValueChange={handleEndTimeChange}
                        value={format(endTime, "HH:mm")}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn giờ kết thúc">
                                {format(endTime, "HH:mm")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>{generateTimeOptions()}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-lg font-semibold">
                    {calculateTotalHours(startTime, endTime)}
                </p>
            </div>
            
            <div className="mt-4">
                <Label htmlFor="category">Danh mục</Label>
                <div className="flex gap-1">
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger
                            className="w-full"
                            disabled={categories.length === 0}
                        >
                            <SelectValue
                                placeholder={
                                    categories.length === 0
                                        ? "Chưa có danh mục"
                                        : "Chọn một danh mục"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat.name}
                                    value={cat.name}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2 border"
                                            style={{
                                                backgroundColor: cat.color,
                                            }}
                                        />
                                        <span>{cat.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-4">
                <Label htmlFor="description">Nội dung công việc</Label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả chi tiết..."
                    className="w-full mt-2 rounded-md bg-gray-800 text-white p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mt-4">
                <Button
                    onClick={handleSaveTimeEntry}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Lưu</span>
                </Button>
            </div>
        </div>
    );
};

export default TimeTracker;