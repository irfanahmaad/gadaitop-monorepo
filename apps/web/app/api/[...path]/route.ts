import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8080/api"

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>
): Promise<NextResponse> {
  const { path } = await params
  const pathname = path.join("/")
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${INTERNAL_API_URL}/${pathname}${searchParams ? `?${searchParams}` : ""}`

  const headers = new Headers()

  // Forward relevant headers
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    headers.set("authorization", authHeader)
  }

  headers.set("content-type", request.headers.get("content-type") || "application/json")

  // Forward accept header if present
  const acceptHeader = request.headers.get("accept")
  if (acceptHeader) {
    headers.set("accept", acceptHeader)
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    }

    // Only include body for methods that support it
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const body = await request.text()
        if (body) {
          fetchOptions.body = body
        }
      } else if (contentType?.includes("multipart/form-data")) {
        // For file uploads, pass the raw body and keep original content-type with boundary
        fetchOptions.body = await request.arrayBuffer()
      }
    }

    const response = await fetch(url, fetchOptions)

    const responseHeaders = new Headers()

    // Forward response headers
    response.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (!["transfer-encoding", "content-encoding", "connection"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    const data = await response.arrayBuffer()

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to connect to API" },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, params)
}
