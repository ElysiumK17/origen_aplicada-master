'use client';
import Link from "next/link";


const Introduccion = () => {
  return (
    <div
      id="inicio"
      className="relative bg-custom-lightGray min-h-screen flex items-center justify-center"
    >
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/imageClinic/Foto6.jpg')", // Cambia la ruta según la ubicación de tu imagen
        }}
      ></div>

      {/* Superposición para mejorar la legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Contenido de texto */}
      <div className="relative text-center text-white max-w-2xl space-y-6 z-10">
        <h1 className="text-4xl font-bold tracking-wider">
          En manos de PROFESIONALES
        </h1>
        <p className="text-lg">
          Somos Gisela y Luis, directores de Origen, centro de especialidades médicas, apostamos a un lugar que acompañe desde el compromiso y la responsabilidad.
        </p>
        <Link
          href="pages/protected/auth/login"
          className="inline-block px-6 py-2 mt-6 text-white bg-custom-orange rounded-md hover:bg-custom-orange hover:text-white transition duration-300"
        >
          Pedir Turno
        </Link>
      </div>
    </div>
  );
};

export default Introduccion;
