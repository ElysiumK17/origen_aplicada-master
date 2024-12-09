import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-custom-lightGray ">
      <div className="container px-4 py-8 mx-auto flex flex-col md:flex-row md:justify-between">
        <div className="w-64 mb-4 md:mb-0">
          {/* Imagen en lugar del texto ORIGEN */}
          <Link href={"/"}>
            <img
              src="/imageClinic/Foto1.jpg" // Ajusta esta ruta según la ubicación de tu logo
              alt="Logo Origen"
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-custom-blueGray">
            Centro de especialidades médicas, trabajando día a día en equipo para construir un lugar mejor para ti.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:gap-12">
          <div className="mb-4 md:mb-0">
            <h2 className="mb-2 font-semibold text-custom-blueGray">Nosotros</h2>
            <ul className="space-y-1 text-sm text-custom-blueGray">
              <li><Link href={"/sobre-nosotros"}>Sobre Nosotros</Link></li>
              <li><Link href={"/contacto"}>Contactanos</Link></li>
              <li><Link href={"/profesionales"}>Profesionales</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-semibold text-custom-blueGray">Seguinos</h2>
            <ul className="space-y-1 text-sm text-custom-blueGray">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t pt-4 border-custom-blueGray">
        <p className="text-center text-sm text-custom-blueGray">
          Copyright © 2024 BRIX Templates | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
