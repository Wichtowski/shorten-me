import { NextRequest, NextResponse } from 'next/server'

const ENDPOINT = process.env.ENV == 'development' ? 'http://localhost:7071' : process.env.AZURE_CREATE_URL_FUNCTION

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        // Validate and transform body
        const original_url = body.original_url || body.url
        const user_id = body.user_id || 'anonymous'
        const custom_slug = body.custom_slug
        if (!original_url || !user_id) {
            return NextResponse.json({ error: 'original_url and user_id are required' }, { status: 400 })
        }
        const payload = { original_url, user_id, ...(custom_slug ? { custom_slug } : {}) }

        const azureRes = await fetch(`${ENDPOINT}/api/create_url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const data = await azureRes.json()
        return NextResponse.json(data, { status: azureRes.status })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 