import { NextRequest, NextResponse } from 'next/server'

// Stockage simple en mémoire pour démonstration
let simpleExpenses: any[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    expenses: simpleExpenses,
    total: simpleExpenses.length,
    note: 'Stockage simple en mémoire'
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const expense = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString()
    }
    
    simpleExpenses.push(expense)
    
    return NextResponse.json({
      success: true,
      message: 'Dépense ajoutée',
      expense,
      total: simpleExpenses.length
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur ajout'
    }, { status: 500 })
  }
}

export async function DELETE() {
  simpleExpenses = []
  return NextResponse.json({
    success: true,
    message: 'Stockage vidé'
  })
}