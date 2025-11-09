// app/api/time-entries/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type TimeEntryPostBody = {
  id: string;
  date: string; // 
  category: string;
  description: string;
  startTime: string;
  endTime: string;   
}
export async function GET() {
  try {
    const timeEntries = await db.timeEntry.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('[TIME_ENTRIES_GET]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TimeEntryPostBody;
    const {
      id,
      date, 
      category,
      description,
      startTime,
      endTime,
    } = body;

    const savedEntry = await db.timeEntry.upsert({
      where: { id: id || '' }, 
      update: {
        date: date, 
        category,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      create: {
        id: id,
        date: date, 
        category,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json(savedEntry, { status: 201 });
  } catch (error) {
    console.error('[TIME_ENTRIES_POST]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}