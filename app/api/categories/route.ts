import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, textColor } = body;

    if (!name) {
      return new NextResponse('Thiếu tên danh mục', { status: 400 });
    }

    const newCategory = await db.category.create({
      data: {
        name: name,
        color: color,
        textColor: textColor,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('[CATEGORIES_POST]', error);
    if (error instanceof Error && (error as any).code === 'P2002') {
        return new NextResponse('Tên danh mục này đã tồn tại', { status: 409 });
    }
    return new NextResponse('Lỗi nội bộ server', { status: 500 });
  }
}