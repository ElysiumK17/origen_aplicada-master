"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { registerProfessinalAction } from "@/actions/auth-action";

// Definición del esquema de validación usando Zod
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  lastname: z.string(),
  phone_number: z.string(),
  id_card: z.string(),
  type_id_card: z.string(),
  date_of_birth: z.string(),
  specialty: z.string(),
  photo: z.instanceof(File).optional(),
});

const SignupForm = () => {
  const route = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      //username: "",
      password: "",
      name: "",
      lastname: "",
      phone_number: "",
      id_card: "",
      type_id_card: "",
      date_of_birth: "",
      specialty: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
   

    try {
      let photoString: string | undefined;
  
      if (selectedFile) {
        // Convertir el archivo a base64
        const reader = new FileReader();
        const filePromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject("Error al leer el archivo");
          reader.readAsDataURL(selectedFile); // Convierte a Base64
        });
  
        photoString = await filePromise;
      }
  
      const payload = {
        ...values,
        date_of_birth: selectedDate || new Date(), // Asegúrate de usar un objeto Date
        photo: photoString, // Asignar la cadena base64
      };
  
      const response = await registerProfessinalAction(payload);
  
      if (response) {
        route.push('/pages/protected/Dashboard/professional')
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-black-600 mb-4">Regístrate</h2>
      <p className="text-sm text-center text-gray-500 mb-6">Completa todos los campos requeridos</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <SignupFormField
            name="name"
            label="Nombre"
            placeholder="Tu nombre"
            formControl={form.control}
          />
          <SignupFormField
            name="lastname"
            label="Apellido"
            placeholder="Tu apellido"
            formControl={form.control}
          />
          <SignupFormField
            name="email"
            label="Email"
            placeholder="Email"
            inputType="email"
            formControl={form.control}
          />
          <SignupFormField
            name="password"
            label="Contraseña"
            placeholder="Contraseña"
            inputType="password"
            formControl={form.control}
          />
          <SignupFormField
            name="phone_number"
            label="Teléfono"
            placeholder="Teléfono"
            formControl={form.control}
          />
          <SignupFormField
            name="id_card"
            label="Documento"
            placeholder="Documento"
            formControl={form.control}
          />
          <SignupFormField
            name="type_id_card"
            label="Nacionalidad"
            placeholder="Nacionalidad"
            formControl={form.control}
          />
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Especialidad</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  defaultValue={field.value}
                >
                  <SelectTrigger className={cn("w-full")}>
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnostico">Diagnostico por Imagenes</SelectItem>
                    <SelectItem value="Ecografías">Ecografías</SelectItem>
                    <SelectItem value="Fonoaudiologia">Fonoadiología</SelectItem>
                    <SelectItem value="Ginecologia">Ginecología</SelectItem>
                    <SelectItem value="Kinesiologo">Kinesiología</SelectItem>
                    <SelectItem value="Odontologia">Odontología</SelectItem>
                    <SelectItem value="Psicologia">Psicología</SelectItem>
                    <SelectItem value="Psiquiatria">Psiquiatría</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">Foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) setSelectedFile(e.target.files[0]);
              }}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Registrarse
          </Button>
        </form>
      </Form>
    </div>
  );
};

interface SignupFormFieldProps {
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
  description?: string;
  inputType?: string;
  formControl: Control<z.infer<typeof formSchema>, any>;
}

const SignupFormField: React.FC<SignupFormFieldProps> = ({
  name,
  label,
  placeholder,
  description,
  inputType,
  formControl,
}) => {
  if (name === "photo") {
    // Campo personalizado para archivos
    return (
      <FormField
        control={formControl}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">{label}</FormLabel>
            <FormControl>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // Actualizamos el valor con el archivo seleccionado
                    field.onChange(e.target.files[0]);
                  }
                }}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormControl>
            {description && (
              <FormDescription className="text-gray-500 text-xs">{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Campo estándar
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={inputType || "text"}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...field}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-gray-500 text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


export default SignupForm;
