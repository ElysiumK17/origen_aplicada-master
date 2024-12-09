import { z } from "zod";

// Esquema Zod para el registro de Paciente
export const RegisterPacienteSchema = z.object({
  name: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El nombre es obligatorio"),
  lastname: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido es obligatorio"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  phone_number: z.string({ required_error: "El número de teléfono es obligatorio" }),
  date_of_birth: z.date({ required_error: "La fecha de nacimiento es obligatoria" }),
  photo: z.string().url().optional(),
  type_id_card: z.string({ required_error: "El tipo de documento es obligatorio" }).min(1, "El tipo de documento es obligatorio"),
  id_card: z.string({ required_error: "El número de documento es obligatorio" }).min(1, "El número de documento es obligatorio"),
});

// Esquema Zod para el login de Paciente
export const LoginPacienteSchema = z.object({
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(4, "La contraseña debe tener al menos 6 caracteres"),
  role: z.string().optional()
});

// Esquema Zod para el registro de Profesional
export const RegisterProfesionalSchema = z.object({
  name: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El nombre es obligatorio"),
  lastname: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido es obligatorio"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  phone_number: z.string({ required_error: "El número de teléfono es obligatorio" }),
  date_of_birth: z.date({ required_error: "La fecha de nacimiento es obligatoria" }),
  specialty: z.string({ required_error: "La especialidad es obligatoria" }).min(1, "La especialidad es obligatoria"),
  photo: z.string().url().optional(),
  type_id_card: z.string({ required_error: "El tipo de documento es obligatorio" }).min(1, "El tipo de documento es obligatorio"),
  id_card: z.string({ required_error: "El número de documento es obligatorio" }).min(1, "El número de documento es obligatorio"),
});

// Esquema Zod para el login de Profesional
export const LoginProfesionalSchema = z.object({
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const LoginAdminSchema = z.object({
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  name: z.string({ required_error: "El nombre es obligatorio" }).min(4, "El nombre debe tener al menos 6 caracteres"), // Ajusté el mensaje de error
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(4, "La contraseña debe tener al menos 4 caracteres"),
})

export const RegisterAdminSchema = z.object({
  email: z.string({ required_error: "El correo electrónico es obligatorio" }).email("Correo electrónico no válido"),
  name: z.string({ required_error: "El nombre es obligatiorio" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type RegisterPaciente = z.infer<typeof RegisterPacienteSchema>;
export type LoginPaciente = z.infer<typeof LoginPacienteSchema>;
export type RegisterProfesional = z.infer<typeof RegisterProfesionalSchema>;
export type LoginProfesional = z.infer<typeof LoginProfesionalSchema>;
export type LoginAdminSchema = z.infer<typeof LoginAdminSchema>
export type RegisterAdminSchema = z.infer<typeof RegisterAdminSchema>