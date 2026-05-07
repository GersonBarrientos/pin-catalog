import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fffdf7]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl relative z-10 bg-white/80 backdrop-blur-xl border border-teal-100 shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="PinArt Logo" className="h-20 w-20 object-contain rounded-full bg-white shadow-sm" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-teal-800 mb-8 tracking-tight">
          Panel de Control
        </h1>
        
        {searchParams?.error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl mb-6 text-sm font-bold shadow-sm">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div>
            <label className="text-slate-600 text-sm mb-2 block font-bold">Correo Electrónico</label>
            <input 
              name="email" 
              type="email" 
              required 
              defaultValue="gersonnizraim@gmail.com"
              className="w-full bg-white border border-teal-100 rounded-xl p-4 text-slate-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all shadow-sm" 
            />
          </div>
          <div>
            <label className="text-slate-600 text-sm mb-2 block font-bold">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-white border border-teal-100 rounded-xl p-4 text-slate-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all shadow-sm" 
            />
          </div>
          <button 
            formAction={login}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-bold p-4 rounded-xl mt-4 transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
