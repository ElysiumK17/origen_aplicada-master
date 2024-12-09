"use client";
import React, { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAdminAction } from "@/actions/singinAdmin";
import { LoginAdminSchema } from "@/libs/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const route = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const values = LoginAdminSchema.parse({ email, password, name });
      const response = await loginAdminAction(values);

      if (response.success) {
        route.push("/pages/protected/Dashboard/admin");
      } else if (response.error) {
        setError(response.error);
      } else {
        setError("Error desconocido en el inicio de sesión.");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError("Por favor, verifica los datos ingresados.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden max-w-5xl">
        {/* Imagen como fondo */}
        <div
          className="hidden md:block bg-cover bg-center"
          style={{ backgroundImage: "url('/imageClinic/Foto4.png')" }}
        ></div>

        {/* Formulario */}
        <div className="flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center text-custom-realBlue mb-6">
              Inicio de Sesión como Administrador
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Introduce tus credenciales para acceder
            </p>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={onSubmit} className="space-y-5">
              <SignupFormField
                label="Email"
                placeholder="Ingresa tu email"
                inputType="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SignupFormField
                label="Nombre"
                placeholder="Ingresa el nombre de administrador"
                inputType="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <SignupFormField
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                inputType="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full bg-custom-realBlue rounded-lg py-3 text-lg"
              >
                Iniciar Sesión
              </Button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente reutilizable para los campos de entrada
interface SignupFormFieldProps {
  label: string;
  placeholder: string;
  inputType?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SignupFormField: React.FC<SignupFormFieldProps> = ({
  label,
  placeholder,
  inputType,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        placeholder={placeholder}
        type={inputType || "text"}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default AdminLogin;
