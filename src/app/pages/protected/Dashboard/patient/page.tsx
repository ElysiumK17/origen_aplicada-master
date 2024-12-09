"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import TurnoTable from "./table";
import TurnoModal from "./reservation";

const DashboardPatient = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isTurnoModalOpen, setIsTurnoModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "historial">(
    "dashboard"
  );

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  
  // Estado para refrescar la tabla
  const [refreshKey, setRefreshKey] = useState(0);

  const openTurnoModal = () => setIsTurnoModalOpen(true);
  const closeTurnoModal = () => setIsTurnoModalOpen(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const closeChangePasswordModal = () => setIsChangePasswordModalOpen(false);

  // Callback para manejar el refresco de la tabla
  const handleTurnoCreated = () => {
    setRefreshKey((prev) => prev + 1);
    closeTurnoModal();
  };


  const handlSubmit = async () => {
    console.log('handlSubmit se está ejecutando');
    
    try {
      if (!oldPassword || !newPassword || !currentPassword) {
        console.log('Todos los campos deben completarse');
        return 'Todos los campos deben completarse';
      }
  
      if (newPassword !== currentPassword) {
        console.log('Las contraseñas no coinciden');
        return 'Las contraseñas no coinciden';
      }
  
      const email = session?.user.email;
  
      if (!email) {
        console.log("error a la hora de identificar el email del usuario");
        return "error a la hora de identificar el email del usuario";
      }
  
      const response = await fetch("/api/auth/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
          email: email,
        }),
      });
  
      console.log('Respuesta de cambio de contraseña:', response.json()); // Esto debería imprimir la respuesta del servidor
    } catch (error) {
      console.error("Error interno:", error);
      return "internal error";
    }
  }
  

  return (
    <div className="min-h-screen flex bg-custom-lightGray text-custom-blueGray">
      {/* Sidebar */}
      <aside className="bg-white shadow-lg w-64 fixed h-full flex flex-col justify-between">
        {/* Parte superior con saludo y botones */}
        <div className="p-6 border-b border-custom-blueGray">
          {isAuthenticated && (
            <div className="space-y-4">
              {/* Saludo */}
              <h1 className="text-2xl font-bold text-custom-blueGray">
                Hola, {session?.user?.name || "Usuario"}
              </h1>
              {/* Botones de navegación */}
              <nav className="space-y-4">
                <ul className="space-y-4">
                  <li>
                    <button
                      onClick={openTurnoModal}
                      className="w-full text-center px-4 py-2 bg-custom-orange text-white rounded-md hover:bg-opacity-80"
                    >
                      Reservar un Turno
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentView("historial")}
                      className="w-full text-center px-4 py-2 bg-custom-orange text-white rounded-md hover:bg-opacity-80"
                    >
                      Historial de Turnos
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentView("dashboard")}
                      className="w-full text-center px-4 py-2 bg-custom-lightGray text-custom-blueGray rounded-md hover:bg-opacity-80"
                    >
                      Volver al Dashboard
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
        {/* Botones "Cambiar Contraseña" y "Cerrar Sesión" */}
        <div className="p-6">
          <button
            onClick={openChangePasswordModal}
            className="w-full px-4 py-2 mb-4 text-white bg-custom-orange rounded-md hover:bg-opacity-80"
          >
            Cambiar Contraseña
          </button>
          <button
            onClick={openLogoutModal}
            className="w-full px-4 py-2 text-white bg-custom-blueGray rounded-md hover:bg-opacity-80"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 ml-64 p-6 space-y-4">
        {currentView === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold">Bienvenido al Portal de Paciente</h2>
            <p className="text-custom-blueGray">
              Aquí puedes gestionar tus turnos y revisar tu información.
            </p>
          </div>
        )}
        {currentView === "historial" && (
          <div className=" h-full">
            <h2 className="text-2xl font-bold mb-4">Historial de Turnos</h2>
            <TurnoTable refreshKey={refreshKey} />
          </div>
        )}
      </main>

      {/* Modal de Turno */}
      {isTurnoModalOpen && (
        <TurnoModal
          isOpen={isTurnoModalOpen}
          onClose={closeTurnoModal}
          onTurnoCreated={handleTurnoCreated}
        />
      )}

      {/* Modal de Cambiar Contraseña */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Cambiar Contraseña</h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ingrese su contraseña actual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ingrese nueva contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirme nueva contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </form>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={closeChangePasswordModal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Implementar lógica de cambio de contraseña aquí
                  handlSubmit()
                  closeChangePasswordModal();
                }}
                className="px-4 py-2 bg-custom-blueGray text-white rounded-md hover:bg-opacity-80"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cerrar Sesión */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">¿Estás seguro de cerrar sesión?</h2>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={closeLogoutModal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 b text-custom-blueGray border border-custom-blueGray rounded-md hover:bg-custom-blueGray hover:text-white transition duration-300"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPatient;
