interface FormSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function FormSection({ title, subtitle, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 text-lg">
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}