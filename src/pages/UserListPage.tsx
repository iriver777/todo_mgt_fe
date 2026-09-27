import { useEffect, useState } from 'react'
import { deleteUser, listUsers } from '../api/users'
import { ApiError } from '../api/client'
import type { User, UserPage } from '../types/user'
import Button from '../components/ui/Button'
import LinkButton from '../components/ui/LinkButton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import UserTable from '../components/UserTable'
import UserCardList from '../components/UserCardList'

const PAGE_SIZE_STORAGE_KEY = 'users_page_size'
const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50]

/** 列表页：分页浏览 + 搜索 + 删除（双视图自适应 PC/Mobile） */
export default function UserListPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
    return stored && PAGE_SIZE_OPTIONS.includes(Number(stored)) ? Number(stored) : DEFAULT_PAGE_SIZE
  })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [data, setData] = useState<UserPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  // 列表请求由分页/搜索状态驱动：effect 内只发起请求，setState 均在异步回调中
  useEffect(() => {
    const controller = new AbortController()
    listUsers({ page, pageSize, search: search || undefined }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setData(result)
        setError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || err instanceof DOMException) return
        setData(null)
        setError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
        setLoading(false)
      })
    return () => controller.abort()
  }, [page, pageSize, search])

  // 搜索防抖 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handlePaginationChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(nextPageSize))
      setPageSize(nextPageSize)
    }
    setPage(nextPage)
    setLoading(true)
    window.scrollTo({ top: 0 })
  }

  /** 事件回调（重试/删除后刷新）：事件处理器中调用，不受 effect 规则限制 */
  const reload = async () => {
    const controller = new AbortController()
    setLoading(true)
    try {
      const result = await listUsers({ page, pageSize, search: search || undefined }, controller.signal)
      if (controller.signal.aborted) return
      setData(result)
      setError(null)
    } catch (err) {
      if (controller.signal.aborted || err instanceof DOMException) return
      setError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      // 当前页删空后回退一页（setPage 变化会触发 effect 自动重新加载）
      const remaining = (data?.total ?? 1) - 1
      const maxPage = Math.max(1, Math.ceil(remaining / pageSize))
      if (page > maxPage) {
        setPage(maxPage)
      } else {
        await reload()
      }
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : '删除失败，请稍后重试')
    } finally {
      setDeleting(false)
    }
  }

  const hasSearched = search !== ''
  const isEmpty = !loading && !error && (data?.items.length ?? 0) === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">用户管理</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">共 {data?.total ?? '—'} 名用户</p>
        </div>
        <LinkButton to="/users/new" variant="primary" size="md" className="w-full sm:w-auto">
          + 新建用户
        </LinkButton>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="搜索姓名或邮箱…"
          aria-label="搜索用户"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-base text-gray-900 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:h-10 sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:outline-indigo-400"
        />
        <svg className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
        {searchInput && (
          <button type="button" onClick={() => setSearchInput('')} aria-label="清空搜索" className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}
      </div>

        {/* 数据区：加载 / 错误 / 空 / 列表（移动端卡片独立展示，桌面端表格在容器内） */}
        {loading ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6 dark:bg-gray-800 dark:ring-gray-700">
            <div className="flex items-center justify-center gap-3 py-16">
              <Spinner size="lg" />
              <span className="text-sm text-gray-500 dark:text-gray-400">加载中…</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6 dark:bg-gray-800 dark:ring-gray-700">
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button variant="secondary" size="md" className="mt-4" onClick={() => void reload()}>
                重试
              </Button>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6 dark:bg-gray-800 dark:ring-gray-700">
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasSearched ? '未找到匹配的用户（当前后端暂未支持搜索参数，返回的仍是全量数据）' : '暂无用户数据'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 移动端：独立卡片直接铺在灰底上 */}
            <div className="md:hidden">
              <UserCardList users={data?.items ?? []} onDelete={setDeleteTarget} disabled={deleting} />
            </div>
            {/* 桌面端：表格在白色容器内 */}
            <div className="hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 md:block sm:p-6 dark:bg-gray-800 dark:ring-gray-700">
              <UserTable users={data?.items ?? []} onDelete={setDeleteTarget} disabled={deleting} />
            </div>
          </>
        )}

      {!loading && !error && !isEmpty && data && (
        <Pagination page={data.page} totalPages={data.totalPages} pageSize={pageSize} onChange={handlePaginationChange} disabled={loading} />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`确认删除用户「${deleteTarget?.name ?? ''}」？`}
        description="删除后不可恢复。"
        confirmText="删除"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  )
}
