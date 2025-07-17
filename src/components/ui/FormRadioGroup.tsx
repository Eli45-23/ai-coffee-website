import { forwardRef } from 'react'

interface Option {
  value: string
  label: string
  description?: string
}

interface FormRadioGroupProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
  name: string
}

const FormRadioGroup = forwardRef<HTMLDivElement, FormRadioGroupProps>(
  ({ label, options, value, onChange, error, hint, required, name }, ref) => {
    return (
      <div ref={ref} className="space-y-4">
        <label className="block text-lg font-medium text-white">
          {label}
          {required && <span className="text-[#10F2B0] ml-1">*</span>}
        </label>
        
        <div className="space-y-3">
          {options.map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="
                  w-5 h-5 mt-0.5 border-2 border-[#333333] 
                  bg-[#1a1a1a] text-[#10F2B0]
                  focus:ring-2 focus:ring-[#10F2B0] focus:ring-offset-0
                  transition-all duration-200
                "
              />
              <div className="flex-1">
                <span className="text-white group-hover:text-[#10F2B0] transition-colors duration-200 font-medium">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                )}
              </div>
            </label>
          ))}
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

FormRadioGroup.displayName = 'FormRadioGroup'

export default FormRadioGroup