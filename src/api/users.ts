import { request } from './client'
import type { User, UserListParams, UserPage, UserPayload } from '../types/user'
import type { RawUserPage } from '../types/user'

/** 分页获取用户列表（后端参数为蛇形命名：page / page_size） */
export async function listUsers({ page, pageSize, search }: UserListParams, signal?: AbortSignal): Promise<UserPage> {
  const raw = await request<RawUserPage>('/users', {
    params: { page, page_size: pageSize, search },
    signal,
  })
  return {
    items: raw.items,
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
    totalPages: raw.total_pages,
  }
}

/** 获取单个用户明细 */
export function getUser(id: number, signal?: AbortSignal): Promise<User> {
  return request<User>(`/users/${id}/`, { signal })
}

/** 创建用户（id 由后端生成） */
export function createUser(payload: UserPayload): Promise<User> {
  return request<User>('/users', { method: 'POST', body: payload })
}

/** 更新用户 */
export function updateUser(id: number, payload: UserPayload): Promise<User> {
  return request<User>(`/users/${id}/`, { method: 'PUT', body: payload })
}

/** 删除用户 */
export function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}/`, { method: 'DELETE' })
}
