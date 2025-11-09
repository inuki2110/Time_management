"use client";
import React from "react";
import { Calendar, momentLocalizer, Event, View, NavigateAction } from "react-big-calendar"; 
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { startOfDay } from "date-fns";
import moment from "moment";
import "moment/locale/vi"; 
moment.locale("vi");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { TimeEntry } from "@/types/TimeEntry";

interface WeekViewProps {
    timeEntries: TimeEntry[];
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
    onTimeEntriesChange: (updatedEntry: { id: string; start: Date; end: Date }) => void;
    selectedDate: Date;
    onDoubleClickEvent: (entry: TimeEntry) => void;
    view: "day" | "week"; 
    onViewChange: (view: View) => void;
    onNavigate: (date: Date) => void;
    getCategoryBgColor: (categoryName: string) => string; 
    getCategoryTextColor: (categoryName: string) => string; 
}

const CustomEvent = ({ event }: any) => {
    const { title, description, textColor } = event;
    return (
        <div 
            style={{ 
                lineHeight: 1.3, 
                overflow: "hidden", 
                paddingTop: "2px",
                color: textColor 
            }}
        >
            {title && (
                <strong style={{ display: "block" }}>{title}</strong>
            )}
            {description && (
                <em style={{
                    fontSize: "0.9em",
                    opacity: 0.9,
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {description}
                </em>
            )}
        </div>
    );
};

export const WeekView: React.FC<WeekViewProps> = ({
    timeEntries,
    onSelectSlot,
    selectedDate,
    onTimeEntriesChange,
    onDoubleClickEvent,
    view,
    onViewChange,
    onNavigate,
    getCategoryBgColor, 
    getCategoryTextColor, 
}) => {

    const events: Event[] = timeEntries.map((entry) => ({
        id: entry.id,
        title: entry.category, 
        description: entry.description,
        start: new Date(entry.startTime),
        end: new Date(entry.endTime),
    }));

    const eventStyleGetter = (event: Event) => {
        const categoryName = (event as any).title || "";
        const backgroundColor = getCategoryBgColor(categoryName);
        const textColor = getCategoryTextColor(categoryName);

        (event as any).textColor = textColor;

        return {
            style: {
                backgroundColor: backgroundColor,
                color: textColor,
                borderRadius: "4px",
                fontWeight: "bold",
                border: "none",
                padding: "2px 6px",
            },
        };
    };

    const handleEventResize = ({ event, start, end }: any) => {
        if (!event) return;
        onTimeEntriesChange({ id: event.id, start, end });
    };

    const handleEventDrop = ({ event, start, end }: any) => {
        if (!event) return;
        onTimeEntriesChange({ id: event.id, start, end });
    };

    const handleDoubleClick = (event: any) => {
        const originalEntry = timeEntries.find(
            (entry) => entry.id === event.id 
        );
        if (originalEntry) {
            onDoubleClickEvent(originalEntry);
        }
    };
    const getEventStart = (event: Event) => event.start as Date;
    const getEventEnd = (event: Event) => event.end as Date;

    const handleNavigateWrapper = (newDate: Date, view: View, action: NavigateAction) => {
        onNavigate(newDate);
    };

    return (
        <div className="h-full">
            <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor={getEventStart}
                endAccessor={getEventEnd}
                selectable
                resizable
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectSlot={onSelectSlot}
                onDoubleClickEvent={handleDoubleClick}
                view={view} 
                onView={onViewChange} 
                toolbar={false}
                style={{ height: "100%" }}
                className="overflow-hidden !border-0"
                eventPropGetter={eventStyleGetter}
                date={selectedDate}
                timeslots={4}
                step={15}
                views={['day', 'week']} 
                onNavigate={handleNavigateWrapper} 
                components={{
                    toolbar: () => null,
                    header: () => null,
                    week: { header: () => null },
                    day: { header: () => null },
                    event: CustomEvent,
                }}
            />
        </div>
    );
};