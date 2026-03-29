import { useState } from 'react'

export function Select({ children, value, onValueChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  )
}

export function SelectTrigger({ children, className = '' }) {
  return <div className={`relative ${className}`}>{children}</div>
}

export function SelectContent({ children }) {
  return <>{children}</>
}

export function SelectItem({ children, value }) {
  return <option value={value}>{children}</option>
}

export function SelectValue({ placeholder }) {
  return <option value="">{placeholder}</option>
}
