"use client";

const Profesionales = () => {
  const professionals = [
    {
      name: "Gisela Kinstler",
      role: "Licenciada en Psicología",
      image: "/imageClinic/Gisela.png",
    },
    {
      name: "Luis Avendaño",
      role: "Licenciado en Psicología",
      image: "/imageClinic/Luis.png",
    },
    {
      name: "Maria Sol Veller",
      role: "Licenciada en Nutrición",
      image: "/imageClinic/Maria.png",
    },
    {
      name: "Mildred Rhys",
      role: "Odontologa",
      image: "/imageClinic/Mildred.png",
    },
    {
      name: "Ignacio Perlo",
      role: "Odontologo",
      image: "/imageClinic/Ignacio.png",
    },
    {
      name: "Deninson Barahona",
      role: "Odontólogo",
      image: "/imageClinic/Deninson.png",
    },
    {
      name: "Natalia Gregorio",
      role: "Odontologa",
      image: "/imageClinic/Natalia.png",
    },
    {
      name: "Mabel Rios",
      role: "Doctora ",
      image: "/imageClinic/Mabel.png",
    },
    {
      name: "Antonella Garrido",
      role: "Ginecologa",
      image: "/imageClinic/Antonella.png",
    },
    {    
    name: "Ariel Romero",
    role: "Licenciado en Kinesiologia",
    image: "/imageClinic/Ariel.png",
  },
  ];

  return (
    <div
    id="professionals"
    className="bg-custom-lightGray text-custom-realBlue w-full mx-auto my-12 p-8 text-center"
  >
    <h2 className="text-3xl font-bold mb-4">Nuestros Profesionales</h2>
    <p className="text-lg mb-2 text-black">
      Estamos capacitados para ofrecerte la atención médica que te mereces.
    </p>
    <p className="text-lg mb-2 text-black">
      Tu salud, tu seguridad y bienestar… son nuestra máxima prioridad.
    </p>
    <p className="text-lg mb-8 text-black">
      Es por eso que contamos con los profesionales más capacitados.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {professionals.map((professional, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <img
            src={professional.image}
            alt={professional.name}
            className="w-40 h-40 rounded-full object-cover mb-4 shadow-lg"
          />
          <h3 className="text-xl font-semibold">{professional.name}</h3>
          <p className="text-gray-600">{professional.role}</p>
        </div>
      ))}
    </div>
  </div>
  );
};

export default Profesionales;
