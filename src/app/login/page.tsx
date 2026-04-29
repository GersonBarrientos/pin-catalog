import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-400"></div>

        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8">
          Acceso Administrador
        </h1>
        
        {searchParams?.error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 text-sm font-medium">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div>
            <label className="text-slate-400 text-sm mb-2 block font-medium">Correo Electrónico</label>
            <input 
              name="email" 
              type="email" 
              required 
              defaultValue="gersonnizraim@gmail.com"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-2 block font-medium">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" 
            />
          </div>
          <button 
            formAction={login}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold p-4 rounded-xl mt-4 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
