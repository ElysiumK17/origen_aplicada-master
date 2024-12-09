"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const RoleForm = () => {
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const route = useRouter()


  const onSubmit = async () => {
    if (!role) {
      setError("Por favor, selecciona una opción.");
      return;
    }

    try {
      const response = await fetch("/api/auth/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage || "Error al actualizar el rol.");
        return;
      }

      const data = await response.json();
      setSuccess(true);
      console.log("Rol actualizado:", data.role);
    if (data.role === "Patient") route.push("/protected/Dashboard/patient");
    if (data.role === "Professional") route.push ("/protected/Dashboard/professional")
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setError("Error al actualizar el rol. Intenta nuevamente.");
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center text-black-600 mb-4">
        ¿Cómo deseas continuar?
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 text-center mb-4">
          Rol actualizado con éxito.
        </p>
      )}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          className={`w-32 ${
            role === "Patient" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setRole("Patient")}
        >
          Paciente
        </Button>
        <Button
          className={`w-32 ${
            role === "Professional" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setRole("Professional")}
        >
          Profesional
        </Button>
      </div>
      <Button
        className="w-full bg-black text-white"
        onClick={onSubmit}
      >
        Confirmar
      </Button>
    </div>
  );
};

export default RoleForm;
