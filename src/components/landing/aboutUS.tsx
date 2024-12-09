"use client";

const AboutUs = () => {
  return (
    <div
      id="about"
      className="bg-custom-lightGray text-realBlue w-full mx-auto my-12 p-8 rounded-lg shadow-md"
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-custom-realBlue">
        Sobre Nosotros
      </h2>
      <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-8">
        <p className="md:w-1/2 text-lg leading-relaxed">
          <span className="font-semibold text-custom-realBlue">Origen</span> es un
          centro de especialidades médicas que cuenta con un grupo de
          profesionales de diferentes especialidades que trabajan de manera
          independiente en un mismo centro.
        </p>
        <p className="md:w-1/2 text-lg leading-relaxed">
          Nos encontramos en:
          <br />
          <span className="font-semibold text-custom-realBlue">
            25 de mayo 38 / Local 2 / Villa Libertador – Entre Ríos
          </span>
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
