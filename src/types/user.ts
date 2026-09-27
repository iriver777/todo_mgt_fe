/** 用户实体（与后端字段一致：id u32, name varchar(255), email varchar(255)） */
export interface User {
  id: number
  name: string
  email: string
}

/** 创建/编辑用户提交体（id 由后端生成） */
export interface UserPayload {
  name: string
  email: string
}

/** GET /users/ 响应中的分页数据（snake_case 原始结构，由 api 层映射为 camelCase） */
export interface RawUserPage {
  items: User[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/** 前端使用的分页数据结构 */
export interface UserPage {
  items: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 列表查询参数 */
export interface UserListParams {
  page: number
  pageSize: number
  search?: string
}
