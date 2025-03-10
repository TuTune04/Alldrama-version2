import ContactInfo from "@/components/contact-info";
import ContactVisual from "@/components/contact-visual";

export default function ContactPage() {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-100">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 text-transparent bg-clip-text">
          Contáctanos
        </h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          ¡Nos encantaría saber de ti! Aquí te mostramos cómo puedes comunicarte con nosotros.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ContactVisual />
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}
