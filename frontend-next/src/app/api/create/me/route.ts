"use server"
import { NextRequest, NextResponse } from 'next/server'

const ENDPOINT = process.env.ENV == 'development' ? 'http://localhost:7071' : process.env.AZURE_CREATE_URL_FUNCTION

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        // Validate and transform body
        const email = body.email
        const password = body.password
        const username = body.username
        if (!email) {
            return NextResponse.json({ error: 'email is required' }, { status: 400 })
        }
        if (!username) {
            return NextResponse.json({ error: 'username is required' }, { status: 400 })
        }
        if (!password) {
            return NextResponse.json({ error: 'password is required' }, { status: 400 })
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'password must be at least 8 characters long' }, { status: 400 })
        }
        if (username.length < 3) {
            return NextResponse.json({ error: 'username must be at least 3 characters long' }, { status: 400 })
        }
        if (username.length > 20) {
            return NextResponse.json({ error: 'username must be less than 20 characters long' }, { status: 400 })
        }
        if (!password.startsWith("$2b$") && !password.startsWith("$2a$")) {
            return NextResponse.json({ error: 'password must be pre-hashed with bcrypt' }, { status: 400 })
        }

        const payload = { email, password, username }
        const azureRes = await fetch(`${ENDPOINT}/api/create_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const data = await azureRes.json()

        if (data.token) {
            const response = NextResponse.json(data, { status: azureRes.status })
            response.cookies.set('token', data.token, {
                httpOnly: true,
                secure: process.env.ENV !== 'development',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            })
            return response
        }

        return NextResponse.json(data, { status: azureRes.status })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 