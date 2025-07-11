import type React from "react"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div
        className={`absolute inset-0
    bg-[url("data:image/svg+xml,%3Csvg%20width='60'%20height='60'%20viewBox='0%200%2060%2060'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cg%20fill='none'%20fillRule='evenodd'%3E%3Cg%20fill='%23e2e8f0'%20fillOpacity='0.4'%3E%3Ccircle%20cx='7'%20cy='7'%20r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]
    dark:bg-[url("data:image/svg+xml,%3Csvg%20width='60'%20height='60'%20viewBox='0%200%2060%2060'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cg%20fill='none'%20fillRule='evenodd'%3E%3Cg%20fill='%23374151'%20fillOpacity='0.2'%3E%3Ccircle%20cx='7'%20cy='7'%20r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]`}
      ></div>

      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        {/* Decorative Elements */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-pink-400/20 to-orange-400/20 blur-3xl"></div>

        {/* Content Container */}
        <div className="relative w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Accede a tu cuenta para continuar</p>
          </div>

          {/* Auth Form Container */}
          <div className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm border border-white/20 dark:bg-slate-800/80 dark:border-slate-700/50">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Al continuar, aceptas nuestros{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
