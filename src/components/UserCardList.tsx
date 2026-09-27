import { Link } from 'react-router'
import type { User } from '../types/user'
import Button from './ui/Button'

interface UserCardListProps {
  users: User[]
  onDelete: (user: User) => void
  disabled?: boolean
}

/** 移动端（md 以下）卡片视图：每张卡片独立成块，整卡可点进明细，底部等宽大按钮 */
export default function UserCardList({ users, onDelete, disabled = false }: UserCardListProps) {
  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li
          key={user.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          {/* 卡片主体：点击进入明细 */}
          <Link
            to={`/users/${user.id}`}
            aria-label={`查看用户 ${user.name} 明细`}
            className="flex items-center gap-3 p-4 transition-colors active:bg-gray-50 dark:active:bg-gray-700/60"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
              <span className="mt-0.5 block break-all text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
            </span>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              #{user.id}
            </span>
          </Link>

          {/* 操作区：三等宽 44px 触控按钮 */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 p-3 dark:border-gray-700">
            <Link
              to={`/users/${user.id}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-700 transition-colors active:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:active:bg-gray-600"
            >
              查看
            </Link>
            <Link
              to={`/users/${user.id}/edit`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-700 transition-colors active:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:active:bg-gray-600"
            >
              编辑
            </Link>
            <Button
              variant="ghost"
              className="h-11 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              disabled={disabled}
              onClick={() => onDelete(user)}
            >
              删除
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
