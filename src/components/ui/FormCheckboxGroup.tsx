import { forwardRef } from 'react'

interface Option {
  value: string
  label: string
}

interface FormCheckboxGroupProps {
  label: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  hint?: string
  required?: boolean
  showOther?: boolean
  otherValue?: string
  onOtherChange?: (value: string) => void
  otherPlaceholder?: string
}

const FormCheckboxGroup = forwardRef<HTMLDivElement, FormCheckboxGroupProps>(
  ({ 
    label, 
    options, 
    value, 
    onChange, 
    error, 
    hint, 
    required,
    showOther = false,
    otherValue = '',
    onOtherChange,
    otherPlaceholder = 'Please specify...'
  }, ref) => {
    
    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
      if (checked) {
        onChange([...value, optionValue])
      } else {
        onChange(value.filter(v => v !== optionValue))
      }
    }

    return (
      <div ref={ref} className="space-y-4">
        <label className="block text-lg font-medium text-white">
          {label}
          {required && <span className="text-[#10F2B0] ml-1">*</span>}
        </label>
        
        <div className="space-y-3">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                className="
                  w-5 h-5 rounded border-2 border-[#333333] 
                  bg-[#1a1a1a] text-[#10F2B0]
                  focus:ring-2 focus:ring-[#10F2B0] focus:ring-offset-0
                  transition-all duration-200
                "
              />
              <span className="text-white group-hover:text-[#10F2B0] transition-colors duration-200">
                {option.label}
              </span>
            </label>
          ))}
          
          {showOther && (
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value.includes('Other')}
                  onChange={(e) => handleCheckboxChange('Other', e.target.checked)}
                  className="
                    w-5 h-5 rounded border-2 border-[#333333] 
                    bg-[#1a1a1a] text-[#10F2B0]
                    focus:ring-2 focus:ring-[#10F2B0] focus:ring-offset-0
                    transition-all duration-200
                  "
                />
                <span className="text-white group-hover:text-[#10F2B0] transition-colors duration-200">
                  Other
                </span>
              </label>
              
              {value.includes('Other') && (
                <input
                  type="text"
                  value={otherValue}
                  onChange={(e) => onOtherChange?.(e.target.value)}
                  placeholder={otherPlaceholder}
                  className="
                    w-full px-4 py-2 rounded-lg ml-8
                    bg-[#1a1a1a] border border-[#333333] 
                    text-white placeholder-gray-400
                    focus:outline-none focus:border-[#10F2B0] focus:ring-1 focus:ring-[#10F2B0]
                    transition-all duration-300
                  "
                />
              )}
            </div>
          )}
        </div>
        
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

FormCheckboxGroup.displayName = 'FormCheckboxGroup'

export default FormCheckboxGroup