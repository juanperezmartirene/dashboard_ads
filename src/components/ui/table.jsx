export function Table({ children, className = '' }) {
  return (
    <table className={`w-full border-collapse ${className}`}>
      {children}
    </table>
  )
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`border-b ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`text-left px-4 py-2 text-sm font-semibold ${className}`}>
      {children}
    </th>
  )
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`border-b hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-2 text-sm ${className}`}>
      {children}
    </td>
  )
}
