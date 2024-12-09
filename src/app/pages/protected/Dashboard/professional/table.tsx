import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Turnos {
  id: string;
  patient_id: string;
  date: string;
  hour: string;
  state: string;
  patientPhone: string;
  patientName: string;
}

type ID = {
  appointment_id: string;
  patient_id: string;
};

const TurnoTable = ({
  refreshKey,
  onTurnoCreated,
}: {
  refreshKey: number;
  onTurnoCreated: () => void;
}) => {
  const [turnos, setTurnos] = useState<Turnos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<Turnos | null>(null);
  const [modalType, setModalType] = useState<"confirm" | "cancel" | null>(null);
  const { data: session } = useSession();
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const itemsPage = 5;

  const pendingTurnos = turnos.filter((turno) => turno.state === "pendiente");
  const historyTurnos = turnos.filter(
    (turno) => turno.state === "cancelado" || turno.state === "realizado"
  );

  const totalPagesPending = Math.ceil(pendingTurnos.length / itemsPage);
  const totalPagesHistory = Math.ceil(historyTurnos.length / itemsPage);

  const currentPendingData = pendingTurnos.slice(
    (currentPagePending - 1) * itemsPage,
    currentPagePending * itemsPage
  );
  const currentHistoryData = historyTurnos.slice(
    (currentPageHistory - 1) * itemsPage,
    currentPageHistory * itemsPage
  );

  useEffect(() => {
    const fetchTurnos = async () => {
      if (!session?.user?.email) {
        setError("No se encontró el email del usuario.");
        setLoading(false);
        return;
      }

      try {
        const email = session.user.email;

        const response = await fetch(
          `http://localhost:3000/api/getAllAppointments?email=${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error("No Existen turnos reservados");
        }

        const data = await response.json();
        setTurnos(data);
        setError(null);
      } catch (err: any) {
        console.error("Error al cargar turnos:", err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, [session?.user?.email, refreshKey]);

  const handleModalOpen = (turno: Turnos, type: "confirm" | "cancel") => {
    setSelectedTurno(turno);
    setModalType(type);
  };

  const handleModalClose = () => {
    setSelectedTurno(null);
    setModalType(null);
  };

  const handleConfirm = async (id: ID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/appointmentApi/confirmAppointment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al confirmar el turno");
      }

      setTurnos((prev) =>
        prev.map((turno) =>
          turno.id === id.appointment_id
            ? { ...turno, state: "realizado" }
            : turno
        )
      );
    } catch (err) {
      console.error("Error al confirmar el turno:", err);
    } finally {
      onTurnoCreated();
      handleModalClose();
    }
  };

  const handleCancel = async (id: ID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/appointmentApi/cancelAppointment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar el turno");
      }

      setTurnos((prev) =>
        prev.map((turno) =>
          turno.id === id.appointment_id
            ? { ...turno, state: "cancelado" }
            : turno
        )
      );
    } catch (err) {
      console.error("Error al cancelar el turno:", err);
    } finally {
      onTurnoCreated();
      handleModalClose();
    }
  };

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className=" h-full">
      {/* Tabla de Turnos Pendientes */}
      <div className=" h-2/4 flex flex-col justify-between">
      <div className="overflow-auto">
        <h2 className="text-xl font-bold mb-4">Turnos Pendientes</h2>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPendingData.map((turno) => (
              <TableRow key={turno.id}>
                <TableCell>{new Date(turno.date).toLocaleDateString()}</TableCell>
                <TableCell>{turno.hour}</TableCell>
                <TableCell>{turno.patientName}</TableCell>
                <TableCell>{turno.patientPhone}</TableCell>
                <TableCell>{turno.state}</TableCell>
                <TableCell>
                  <button
                    className="px-4 py-2 text-white bg-green-500 rounded-md"
                    onClick={() => handleModalOpen(turno, "confirm")}
                  >
                    Confirmar
                  </button>
                  <button
                    className="px-4 py-2 ml-2 text-white bg-red-500 rounded-md"
                    onClick={() => handleModalOpen(turno, "cancel")}
                  >
                    Cancelar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded-md"
          onClick={() => setCurrentPagePending((prev) => Math.max(prev - 1, 1))}
          disabled={currentPagePending === 1}
        >
          Anterior
        </button>
        <span className="px-4 py-2">
          Página {currentPagePending} de {totalPagesPending}
        </span>
        <button
          className="px-4 py-2 bg-gray-300 rounded-md"
          onClick={() =>
            setCurrentPagePending((prev) =>
              Math.min(prev + 1, totalPagesPending)
            )
          }
          disabled={currentPagePending === totalPagesPending}
        >
          Siguiente
        </button>
      </div>
      </div>

      {/* Tabla de Historial de Turnos */}
      <div className="h-2/4">
          <div className="flex flex-col justify-between h-full">
              <div className="overflow-auto">
                <h2 className="text-xl font-bold mb-4">Historial de Turnos</h2>
                <Table className="w-full overflow-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentHistoryData.map((turno) => (
                      <TableRow key={turno.id}>
                        <TableCell>{new Date(turno.date).toLocaleDateString()}</TableCell>
                        <TableCell>{turno.hour}</TableCell>
                        <TableCell>{turno.patientName}</TableCell>
                        <TableCell>{turno.patientPhone}</TableCell>
                        <TableCell>{turno.state}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() =>
                    setCurrentPageHistory((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPageHistory === 1}
                >
                  Anterior
                </button>
                <span className="px-4 py-2">
                  Página {currentPageHistory} de {totalPagesHistory}
                </span>
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() =>
                    setCurrentPageHistory((prev) =>
                      Math.min(prev + 1, totalPagesHistory)
                    )
                  }
                  disabled={currentPageHistory === totalPagesHistory}
                >
                  Siguiente
                </button>
            </div>
        </div>
      </div>

      {/* Modal */}
      {modalType && selectedTurno && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">
              {modalType === "confirm" ? "Confirmar Turno" : "Cancelar Turno"}
            </h2>
            <p className="mt-2">
              {modalType === "confirm"
                ? `¿Estás seguro de que el turno con ${selectedTurno.patientName} ya fue realizado?`
                : `¿Estás seguro de que deseas cancelar el turno con ${selectedTurno.patientName}?`}
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 mr-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
                onClick={handleModalClose}
              >
                Cerrar
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  modalType === "confirm"
                    ? "bg-custom-blueGray text-white"
                    : "bg-custom-blueGray text-white"
                }`}
                onClick={() =>
                  modalType === "confirm"
                    ? handleConfirm({
                        appointment_id: selectedTurno?.id,
                        patient_id: selectedTurno?.patient_id,
                      })
                    : handleCancel({
                        appointment_id: selectedTurno?.id,
                        patient_id: selectedTurno?.patient_id,
                      })
                }
              >
                {modalType === "confirm" ? "Confirmar" : "Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnoTable;
