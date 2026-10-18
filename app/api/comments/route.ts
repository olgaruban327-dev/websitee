import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Список запрещенных слов (мат и спам)
const FORBIDDEN_WORDS = [
  // Русский мат
  'бля', 'сука', 'пизд', 'ебал', 'хуй', 'ёб', 'еб', 'хер', 'манд', 'пидор', 'гандон',
  // Английский мат
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'dick', 'cock', 'pussy', 'cunt',
  // Немецкий мат
  'scheiße', 'scheisse', 'arsch', 'fick',
  // Спам слова
  'casino', 'viagra', 'porn', 'xxx', 'bitcoin', 'crypto', 'loan', 'click here',
]

// Функция для получения IP адреса
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  return 'unknown'
}

// Функция проверки на мат
function containsForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return FORBIDDEN_WORDS.some(word => lowerText.includes(word))
}

// GET - получить все комментарии
export async function GET() {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, name, text, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Error reading comments:', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })
  }
}

// POST - добавить комментарий
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, text } = body

    // Валидация
    if (!name || !text) {
      return NextResponse.json({ error: 'Name and text are required' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
    }

    if (text.length > 500) {
      return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
    }

    if (text.length < 3) {
      return NextResponse.json({ error: 'Comment is too short' }, { status: 400 })
    }

    // Проверка на мат и спам
    if (containsForbiddenWords(name) || containsForbiddenWords(text)) {
      return NextResponse.json({ error: 'Comment contains inappropriate content' }, { status: 400 })
    }

    const clientIp = getClientIp(request)

    // АНТИ-ФЛУД: Проверяем время последнего комментария от этого IP
    const FLOOD_TIMEOUT_MINUTES = 1
    const floodCheck = new Date()
    floodCheck.setMinutes(floodCheck.getMinutes() - FLOOD_TIMEOUT_MINUTES)

    const { data: recentComments } = await supabase
      .from('comments')
      .select('created_at')
      .eq('ip', clientIp)
      .gte('created_at', floodCheck.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentComments && recentComments.length > 0) {
      const lastCommentTime = new Date(recentComments[0].created_at).getTime()
      const now = Date.now()
      const secondsLeft = Math.ceil((FLOOD_TIMEOUT_MINUTES * 60 * 1000 - (now - lastCommentTime)) / 1000)
      
      return NextResponse.json(
        { error: `Please wait ${secondsLeft} seconds before posting again` },
        { status: 429 }
      )
    }

    // Проверка: один комментарий на IP (всего)
    const { data: existingComments } = await supabase
      .from('comments')
      .select('id')
      .eq('ip', clientIp)
      .limit(1)

    if (existingComments && existingComments.length > 0) {
      return NextResponse.json({ error: 'You have already left a comment' }, { status: 429 })
    }

    // Создаем новый комментарий
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert([
        {
          name: name.trim(),
          text: text.trim(),
          ip: clientIp,
        }
      ])
      .select('id, name, text, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ comment: newComment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE - удалить комментарий (только для админа)
export async function DELETE(request: NextRequest) {
  try {
    // Проверяем, что пользователь - админ
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
