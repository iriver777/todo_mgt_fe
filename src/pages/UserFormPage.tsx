import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { createUser, getUser, updateUser } from '../api/users'
import { ApiError } from '../api/client'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LinkButton from '../components/ui/LinkButton'
import Spinner from '../components/ui/Spinner'

interface FormState {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

const MAX_LENGTH = 255

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  const name = form.name.trim()
  const email = form.email.trim()

  if (!name) errors.name = '姓名不能为空'
  else if (name.length > MAX_LENGTH) errors.name = `姓名不能超过 ${MAX_LENGTH} 个字符`

  if (!email) errors.email = '邮箱不能为空'
  else if (email.length > MAX_LENGTH) errors.email = `邮箱不能超过 ${MAX_LENGTH} 个字符`
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '邮箱格式不正确'

  return errors
}

/** 新建/编辑共用表单页：路由含 :id 为编辑模式，否则为新建模式 */
export default function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = id !== undefined

  const [form, setForm] = useState<FormState>({ name: '', email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  // 编辑模式进入时先展示加载态（初始状态，非 effect 中设置）
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  // 编辑模式：加载现有数据（effect 内只发起请求，setState 均在异步回调中）
  useEffect(() => {
    if (!isEdit) return
    const userId = Number(id)
    const controller = new AbortController()
    getUser(userId, controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return
        setForm({ name: user.name, email: user.email })
        setPageError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || err instanceof DOMException) return
        setPageError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
        setLoading(false)
      })
    return () => controller.abort()
  }, [isEdit, id])

  const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    // 输入时清除该字段错误
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setPageError(null)
    const payload = { name: form.name.trim(), email: form.email.trim() }
    try {
      if (isEdit) {
        await updateUser(Number(id), payload)
        navigate(`/users/${id}`)
      } else {
        await createUser(payload)
        navigate('/users')
      }
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : '提交失败，请稍后重试')
      setSubmitting(false)
    }
  }

  const retry = () => {
    const userId = Number(id)
    const controller = new AbortController()
    setLoading(true)
    getUser(userId, controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return
        setForm({ name: user.name, email: user.email })
        setPageError(null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || err instanceof DOMException) return
        setPageError(err instanceof ApiError ? err.message : '加载失败，请稍后重试')
        setLoading(false)
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20">
        <Spinner size="lg" />
        <span className="text-sm text-gray-500 dark:text-gray-400">加载中…</span>
      </div>
    )
  }

  if (pageError && isEdit && !form.name) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{pageError}</p>
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
        <LinkButton to={isEdit ? `/users/${id}` : '/users'} variant="ghost">
          ← 返回
        </LinkButton>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8 dark:bg-gray-800 dark:ring-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{isEdit ? '编辑用户' : '新建用户'}</h1>
        {isEdit && <p className="mt-1 font-mono text-xs text-gray-400">#{id}</p>}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5" noValidate>
          <Input
            label="姓名"
            name="name"
            value={form.name}
            onChange={setField('name')}
            error={errors.name}
            hint={`最多 ${MAX_LENGTH} 个字符`}
            placeholder="请输入姓名"
            maxLength={MAX_LENGTH + 1}
            autoFocus
            required
          />
          <Input
            label="邮箱"
            name="email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="name@example.com"
            maxLength={MAX_LENGTH + 1}
            required
          />

          {pageError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{pageError}</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={submitting} className="sm:order-first">
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '保存中…' : isEdit ? '保存修改' : '创建'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
