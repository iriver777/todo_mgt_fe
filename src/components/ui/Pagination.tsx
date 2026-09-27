import Button from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  pageSize: number
  pageSizeOptions?: number[]
  /** 切换页码或每页条数（pageSize 变化时由父组件重置到第 1 页） */
  onChange: (page: number, pageSize: number) => void
  disabled?: boolean
}

/** 计算页码窗口：首页/尾页恒显，中间最多 5 个页码，其余用省略号 */
function pageWindow(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1, 2, totalPages - 1].filter((p) => p >= 1 && p <= totalPages))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}

/** 分页控件：移动端精简（上一页/下一页），桌面端完整页码 + 每页条数选择 */
export default function Pagination({ page, totalPages, pageSize, pageSizeOptions = [10, 20, 50], onChange, disabled = false }: PaginationProps) {
  if (totalPages <= 0) return null

  const go = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), totalPages)
    if (clamped !== page) onChange(clamped, pageSize)
  }

  const pageNumClass = (active: boolean) =>
    `hidden h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm sm:inline-flex ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
    }`

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="分页">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => go(page - 1)} disabled={disabled || page <= 1} aria-label="上一页">
          上一页
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          第 <span className="font-medium text-gray-900 dark:text-gray-100">{page}</span> / {totalPages} 页
        </span>
        <Button variant="secondary" size="sm" onClick={() => go(page + 1)} disabled={disabled || page >= totalPages} aria-label="下一页">
          下一页
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {pageWindow(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="hidden px-1 text-sm text-gray-400 sm:inline">
              …
            </span>
          ) : (
            <button key={p} type="button" disabled={disabled} onClick={() => go(p)} aria-current={p === page ? 'page' : undefined} className={pageNumClass(p === page)}>
              {p}
            </button>
          ),
        )}
        <select
          aria-label="每页条数"
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onChange(1, Number(e.target.value))}
          className="ml-2 h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:outline-2 focus:outline-indigo-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:outline-indigo-400"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n} 条/页
            </option>
          ))}
        </select>
      </div>
    </nav>
  )
}
