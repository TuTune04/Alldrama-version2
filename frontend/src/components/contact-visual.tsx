import { MessageSquare, Users, Clock, CheckCircle2 } from "lucide-react";

export default function ContactVisual() {
  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative shadow-[0_0_15px_rgba(123,0,255,0.15)]">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-purple-900/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cyan-900/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-pink-900/20 blur-3xl"></div>
      </div>

      <div className="relative p-8">
        <div className="flex flex-col items-center justify-center h-full space-y-10">
          {/* Ilustración decorativa */}
          <div className="relative w-64 h-64 mx-auto mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-900/40 to-purple-600/20 flex items-center justify-center backdrop-blur-sm border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <MessageSquare className="h-20 w-20 text-purple-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-900/40 to-pink-600/20 flex items-center justify-center backdrop-blur-sm border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                <Users className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <div className="absolute bottom-4 left-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-900/40 to-cyan-600/20 flex items-center justify-center backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                <Clock className="h-7 w-7 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Valores de la empresa */}
          <div className="space-y-6 max-w-md text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 text-transparent bg-clip-text">
              Estamos Aquí Para Ti
            </h2>
            <p className="text-gray-400">
              Nuestro equipo dedicado está comprometido a brindar un servicio y soporte excepcionales.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-2 rounded-full mb-3 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Respuesta Rápida</h3>
                <p className="text-sm text-gray-400">Respondemos en menos de 24 horas</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-lg bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-full mb-3 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-white">Soporte Experto</h3>
                <p className="text-sm text-gray-400">Equipo capacitado listo para ayudar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
