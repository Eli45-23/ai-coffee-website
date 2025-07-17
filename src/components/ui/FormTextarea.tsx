import { forwardRef } from 'react'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-lg font-medium text-white">
          {label}
          {required && <span className="text-[#10F2B0] ml-1">*</span>}
        </label>
        
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl 
            bg-[#1a1a1a] border border-[#333333] 
            text-white placeholder-gray-400
            focus:outline-none focus:border-[#10F2B0] focus:ring-1 focus:ring-[#10F2B0]
            transition-all duration-300
            resize-vertical min-h-[100px]
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
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

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea