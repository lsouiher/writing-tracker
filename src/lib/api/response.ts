import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/domain'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { data, error: null },
    { status }
  )
}

export function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>(
    { data: null, error: { code, message } },
    { status }
  )
}
