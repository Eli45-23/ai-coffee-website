import { useState } from 'react'
import { validateMenuFile } from '@/lib/validations'

interface FormFileUploadProps {
  label: string
  onFileSelect: (file: File | null) => void
  selectedFile?: File | null
  accept?: string
  maxSize?: string
  error?: string
  hint?: string
  required?: boolean
  multiple?: boolean
}

export default function FormFileUpload({
  label,
  onFileSelect,
  selectedFile,
  accept = "image/*,.pdf",
  maxSize = "5MB",
  error,
  hint,
  required = false,
  multiple = false
}: FormFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')

  const handleFile = (file: File) => {
    setUploadError('')
    
    // Validate file
    const validation = validateMenuFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file')
      return
    }
    
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    onFileSelect(null)
    setUploadError('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-lg font-medium text-white">
        {label}
        {required && <span className="text-[#10F2B0] ml-1">*</span>}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300
          ${dragActive 
            ? 'border-[#10F2B0] bg-[#10F2B0]/5' 
            : 'border-[#333333] hover:border-[#10F2B0]/50'
          }
          ${(error || uploadError) ? 'border-red-500' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedFile ? (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-lg bg-[#10F2B0]/10">
              <svg className="w-6 h-6 text-[#10F2B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-lg bg-[#333333]">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-white">
                <span className="text-[#10F2B0] hover:text-[#10F2B0]/80 cursor-pointer">
                  Click to upload
                </span> or drag and drop
              </p>
              <p className="text-gray-400 text-sm">
                JPG, PNG or PDF (Max {maxSize})
              </p>
            </div>
          </div>
        )}
      </div>

      {hint && !error && !uploadError && (
        <p className="text-sm text-gray-400">{hint}</p>
      )}
      
      {(error || uploadError) && (
        <p className="text-sm text-red-400">{error || uploadError}</p>
      )}
    </div>
  )
}