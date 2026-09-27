import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { deleteUser, getUser } from '../api/users'
import { ApiError } from '../api/client'
import type { User } from '../types/user'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LinkButton from '../components/ui/LinkButton'
import Spinner from '../components/ui/Spinner'

/** 用户明细页：字段展示 + 编辑/删除/返回 */
export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const userId = Number(id)
  const invalidId = id === undefined || !Number.isInteger(userId) || userId <= 0

  // 请求由 URL 参数驱动：effect 内只发起请求，setState 均在异步回调中
  useEffect(() => {
    if (invalidId) return
    const controller = new AbortController()
    getUser(userId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setUser(result)
        setError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || err instanceof DOMException) return
        setUser(null)
        setError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
        setLoading(false)
      })
    return () => controller.abort()
  }, [userId, invalidId])

  const handleDelete = async () => {
    if (!user) return
    setDeleting(true)
    try {
      await deleteUser(user.id)
      navigate('/users', { replace: true })
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : '删除失败，请稍后重试')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const retry = () => {
    const controller = new AbortController()
    setLoading(true)
    getUser(userId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setUser(result)
        setError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || err instanceof DOMException) return
        setError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
        setLoading(false)
      })
  }

  if (invalidId) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">无效的用户 ID</p>
        <div className="mt-4 flex justify-center gap-2">
          <LinkButton to="/users" variant="ghost">
            返回列表
          </LinkButton>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20">
        <Spinner size="lg" />
        <span className="text-sm text-gray-500 dark:text-gray-400">加载中…</span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? '用户不存在'}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" onClick={retry}>
            重试
          </Button>
          <LinkButton to="/users" variant="ghost">
            返回列表
          </LinkButton>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <LinkButton to="/users" variant="ghost" aria-label="返回用户列表">
          ← 返回列表
        </LinkButton>
        <span className="font-mono text-xs text-gray-400">#{user.id}</span>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
            <dd className="font-mono text-sm text-gray-900 dark:text-gray-100">{user.id}</dd>
          </div>
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">姓名</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100">{user.name}</dd>
          </div>
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">邮箱</dt>
            <dd className="text-sm break-all text-gray-900 dark:text-gray-100">{user.email}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={deleting} className="sm:order-first">
            删除
          </Button>
          <LinkButton to={`/users/${user.id}/edit`} variant="primary" size="md">
            编辑
          </LinkButton>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`确认删除用户「${user.name}」？`}
        description="删除后不可恢复。"
        confirmText="删除"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => !deleting && setConfirmOpen(false)}
      />
    </div>
  )
}
