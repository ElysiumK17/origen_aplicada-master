"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

const RoleForm = () => {
  const [roleUser, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const route = useRouter();
  const { data: session, update } = useSession();

  const handleUpdateRole = async () => {
    try {
      if (!roleUser) {
        setError("Por favor, selecciona una opción.");
        return;
      }

      if(!session){
        setError("Error sobrela informacion de usuario.");
        return;
      }

      // Actualiza el rol en la sesión de NextAuth
      const newSession = {
        ...session,
        user: {
          ...session.user,
          role: roleUser,
        },
      };

      // Llama al método `update` para actualizar la sesión
      const data = await update(newSession);

      console.log(session)

      
      if (data?.user.role === "Patient") {
        route.push("/pages/protected/dashboard/patient");
      }

      if (data?.user.role === "Professional") {
        route.push("/pages/protected/dashboard/professional");
      }
      

      setSuccess(true);
    } catch (err) {
      console.error("Error al actualizar el rol:", err);
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
          className={`w-32 ${roleUser === "Patient" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("Patient")}
        >
          Paciente
        </Button>
        <Button
          className={`w-32 ${roleUser === "Professional" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("Professional")}
        >
          Profesional
        </Button>
      </div>
      <Button className="w-full bg-black text-white" onClick={handleUpdateRole}>
        Confirmar
      </Button>
    </div>
  );
};

export default RoleForm;
