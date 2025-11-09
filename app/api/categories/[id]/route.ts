import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return new NextResponse('Thiếu ID của danh mục', { status: 400 });
    }

    const categoryToDelete = await db.category.findUnique({
      where: { id },
    });

    if (!categoryToDelete) {
      return new NextResponse('Không tìm thấy danh mục', { status: 404 });
    }

    const categoryName = categoryToDelete.name;

    await db.$transaction([
      db.timeEntry.updateMany({
        where: { category: categoryName },
        data: { category: "" }, 
      }),
      db.category.delete({
        where: { id: id },
      })
    ]);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('[CATEGORY_DELETE]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}