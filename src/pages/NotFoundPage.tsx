import LinkButton from '../components/ui/LinkButton'

/** 404 页面 */
export default function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</p>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">页面不存在或已被移除</p>
      <div className="mt-6 flex justify-center">
        <LinkButton to="/users" variant="primary" size="md">
          返回用户列表
        </LinkButton>
      </div>
    </div>
  )
}
