import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Image src="/logo.png" alt="Logotipo" width={170} height={40} />
            </div>
            <p className="text-sm text-muted-foreground">
              Disfruta de la mejor experiencia de ver películas con alta calidad y contenido diverso.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/#new" className="text-sm hover:underline">
                  Películas Nuevas
                </Link>
              </li>
              <li>
                <Link href="/#hot" className="text-sm hover:underline">
                  Películas Populares
                </Link>
              </li>
              <li>
                <Link href="/#recommended" className="text-sm hover:underline">
                  Películas Recomendadas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm hover:underline">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:underline">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:underline">
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm hover:underline">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Conéctate con nosotros</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-foreground hover:text-primary">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-foreground hover:text-primary">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-foreground hover:text-primary">
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AllDrama. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
