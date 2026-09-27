import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/** 通用文本输入框：带 label、校验错误与提示，样式适配深色模式 */
export default function Input({ label, error, hint, className = '', id, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`block h-11 w-full rounded-lg border bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-0 sm:text-sm dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${
          error
            ? 'border-red-500 focus:outline-red-500'
            : 'border-gray-300 focus:outline-indigo-600 dark:border-gray-600 dark:focus:outline-indigo-400'
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  )
}
