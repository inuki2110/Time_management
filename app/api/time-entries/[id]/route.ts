import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Xóa TimeEntry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return new NextResponse('Thiếu ID', { status: 400 });

    await db.timeEntry.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TIME_ENTRY_DELETE]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}

// Cập nhật TimeEntry (drag & drop)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return new NextResponse('Thiếu ID', { status: 400 });

    const body = await request.json();
    const { startTime, endTime, date } = body;

    if (!startTime || !endTime || !date) {
      return new NextResponse('Thiếu thông tin (startTime, endTime, date)', { status: 400 });
    }

    const updatedEntry = await db.timeEntry.update({
      where: { id },
      data: { startTime: new Date(startTime), endTime: new Date(endTime), date },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('[TIME_ENTRY_PUT]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}
