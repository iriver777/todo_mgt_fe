/** 加载指示器：纯 CSS spinner，size 控制尺寸 */
export default function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-4' : 'h-6 w-6 border-[3px]'
  return (
    <span
      role="status"
      aria-label="加载中"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-indigo-600 dark:text-indigo-400 ${sizeClass} ${className}`}
    />
  )
}
