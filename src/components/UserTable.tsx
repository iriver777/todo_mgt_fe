import type { User } from '../types/user'
import Button from './ui/Button'
import LinkButton from './ui/LinkButton'

interface UserTableProps {
  users: User[]
  onDelete: (user: User) => void
  disabled?: boolean
}

/** PC（md+）表格视图：ID / 姓名 / 邮箱 / 操作 */
export default function UserTable({ users, onDelete, disabled = false }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead>
          <tr className="text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            <th scope="col" className="px-4 py-3">ID</th>
            <th scope="col" className="px-4 py-3">姓名</th>
            <th scope="col" className="px-4 py-3">邮箱</th>
            <th scope="col" className="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60">
              <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{user.id}</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                <LinkButton to={`/users/${user.id}`} variant="ghost" className="px-0 hover:bg-transparent hover:underline">
                  {user.name}
                </LinkButton>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <LinkButton to={`/users/${user.id}`}>查看</LinkButton>
                  <LinkButton to={`/users/${user.id}/edit`}>编辑</LinkButton>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30" disabled={disabled} onClick={() => onDelete(user)}>
                    删除
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
