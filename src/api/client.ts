/** 后端返回的统一响应包装：{ success: boolean, data: T } */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

/** 统一 API 错误：携带 HTTP 状态码与后端 message */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://todo-mgt.onrender.com'
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090'
const DEFAULT_TIMEOUT_MS = 15000

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** 会拼接到 URL 的查询参数（自动过滤 undefined/空串） */
  params?: Record<string, string | number | undefined>
  body?: unknown
  timeoutMs?: number
  /** 外部取消信号（与超时控制叠加生效） */
  signal?: AbortSignal
}

/**
 * 统一请求函数：
 * - 成功（2xx 且 success===true）返回 data 字段
 * - 非 2xx 或 success===false 抛出 ApiError
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, body, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options

  const url = new URL(path, API_BASE_URL + '/')
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    // 网络错误 / 超时（AbortError）
    throw new ApiError(err instanceof Error && err.name === 'AbortError' ? '请求超时，请稍后重试' : '网络错误，请检查网络后重试', 0)
  } finally {
    clearTimeout(timer)
  }

  // 解析响应体（可能为空，如 204）
  const text = await res.text()
  let json: unknown = undefined
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      // 非 JSON 响应体，保持 undefined
    }
  }

  if (!res.ok) {
    const message = extractMessage(json) ?? `请求失败（HTTP ${res.status}）`
    throw new ApiError(message, res.status)
  }

  const envelope = json as ApiEnvelope<T> | undefined
  if (envelope && typeof envelope === 'object' && 'success' in envelope) {
    if (!envelope.success) {
      throw new ApiError(extractMessage(envelope) ?? '请求失败', res.status)
    }
    return envelope.data
  }

  // 无包装结构时原样返回
  return json as T
}

function extractMessage(json: unknown): string | undefined {
  if (typeof json !== 'object' || json === null) return undefined
  const record = json as Record<string, unknown>
  if (typeof record.message === 'string') return record.message
  if (typeof record.detail === 'string') return record.detail
  if (typeof record.error === 'string') return record.error
  return undefined
}
