import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactInfo() {
  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-[0_0_15px_rgba(123,0,255,0.15)]">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white">Información de Contacto</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-5">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-900/50 p-3 rounded-lg">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Teléfono</h3>
              <p className="text-cyan-400 font-medium">+1 (xxx) xxx-xxxx</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-pink-900/50 p-3 rounded-lg">
              <Mail className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Correo Electrónico</h3>
              <p className="text-pink-400 font-medium">supporter@alldrama.net</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-cyan-900/50 p-3 rounded-lg">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">Horario de Atención</h3>
              <p className="text-gray-400">
                Lunes - Viernes: <span className="text-cyan-400">9:00 AM - 5:00 PM</span>
                <br />
                Sábado & Domingo: <span className="text-gray-500">Cerrado</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <h3 className="font-medium text-gray-200 mb-4">Conéctate con Nosotros</h3>
          <div className="flex space-x-3">
            <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button size="icon" className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Button>
            <Button size="icon" className="bg-blue-700 hover:bg-blue-800 text-white rounded-full" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
