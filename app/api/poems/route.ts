import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'poems.json')

// Инициализация файла если не существует
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ poems: [] }, null, 2), 'utf-8')
  }
}

// GET - получить все стихи
export async function GET() {
  try {
    await ensureDataFile()
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading poems:', error)
    return NextResponse.json({ poems: [] })
  }
}

// POST - добавить стихотворение (только для админа)
export async function POST(req: NextRequest) {
  try {
    // Проверка авторизации
    const admin = await verifyAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, text } = body

    if (!title || !text) {
      return NextResponse.json({ error: 'Title and text are required' }, { status: 400 })
    }

    await ensureDataFile()
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)

    // Находим максимальный ID
    const maxId = data.poems.length > 0
      ? Math.max(...data.poems.map((p: any) => p.id))
      : 0

    const newPoem = {
      id: maxId + 1,
      title: title.trim(),
      text: text.trim(),
      date: new Date().toISOString(),
    }

    data.poems.push(newPoem)

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({ success: true, poem: newPoem })
  } catch (error) {
    console.error('Error adding poem:', error)
    return NextResponse.json({ error: 'Failed to add poem' }, { status: 500 })
  }
}

// DELETE - удалить стихотворение (только для админа)
export async function DELETE(req: NextRequest) {
  try {
    // Проверка авторизации
    const admin = await verifyAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await ensureDataFile()
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)

    data.poems = data.poems.filter((p: any) => p.id !== id)

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting poem:', error)
    return NextResponse.json({ error: 'Failed to delete poem' }, { status: 500 })
  }
}
