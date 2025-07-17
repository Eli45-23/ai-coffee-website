import { forwardRef } from 'react'

interface Option {
  value: string
  label: string
}

interface FormDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Option[]
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
}

const FormDropdown = forwardRef<HTMLSelectElement, FormDropdownProps>(
  ({ label, options, error, hint, required, placeholder = 'Select an option...', className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-lg font-medium text-white">
          {label}
          {required && <span className="text-[#10F2B0] ml-1">*</span>}
        </label>
        
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl 
            bg-[#1a1a1a] border border-[#333333] 
            text-white
            focus:outline-none focus:border-[#10F2B0] focus:ring-1 focus:ring-[#10F2B0]
            transition-all duration-300
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-white bg-[#1a1a1a]">
              {option.label}
            </option>
          ))}
        </select>
        
        {hint && !error && (
          <p className="text-sm text-gray-400">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

FormDropdown.displayName = 'FormDropdown'

export default FormDropdown