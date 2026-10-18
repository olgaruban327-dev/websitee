import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - получить все стихи
export async function GET() {
  try {
    const { data: poems, error } = await supabaseAdmin
      .from('poems')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ poems: poems || [] })
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

    const { data: poem, error } = await supabaseAdmin
      .from('poems')
      .insert([{ title: title.trim(), text: text.trim() }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, poem })
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

    const { error } = await supabaseAdmin
      .from('poems')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting poem:', error)
    return NextResponse.json({ error: 'Failed to delete poem' }, { status: 500 })
  }
}
