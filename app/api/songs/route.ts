import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - получить все песни
export async function GET() {
  try {
    const { data: songs, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ songs: songs || [] })
  } catch (error) {
    console.error('Error reading songs:', error)
    return NextResponse.json({ songs: [] })
  }
}

// POST - добавить новую песню (только для админа)
export async function POST(req: NextRequest) {
  try {
    // Проверка авторизации
    const admin = await verifyAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, youtubeUrl, genre, story, language, year } = body

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 })
    }

    const { data: song, error } = await supabaseAdmin
      .from('songs')
      .insert([{
        title: title.trim(),
        youtube_url: youtubeUrl.trim(),
        genre: genre || 'Авторская песня',
        language: language || 'Русский',
        story: story?.trim() || null,
        year: year || new Date().getFullYear(),
        views: 0,
        featured: false,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, song })
  } catch (error) {
    console.error('Error adding song:', error)
    return NextResponse.json({ error: 'Failed to add song' }, { status: 500 })
  }
}

// DELETE - удалить песню (только для админа)
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
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('songs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }
}
