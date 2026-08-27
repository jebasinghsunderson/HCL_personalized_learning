import Link from "next/link"
import { ArrowLeft, Brain } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Brain className="h-8 w-8 text-indigo-600" />
        <span className="text-2xl font-bold text-slate-900">LearnPath AI</span>
      </Link>
      {children}
    </div>
  )
}
