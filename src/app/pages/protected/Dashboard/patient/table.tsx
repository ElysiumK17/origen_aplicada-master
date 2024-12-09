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

type ID = {
    patient_id: string;
    appointment_id: string;
};

interface Reservacion {
    patient_id: string;
    appointment_id: string;
    state: string;
    Appointment: {
        hour: string;
        date: string;
        Professional: {
            specialty: string;
            User: {
                name: string;
                lastName: string;
            };
        };
    };
}

const Modal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold">¿Está seguro?</h2>
                <p className="mt-4">¿Desea cancelar este turno?</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-custom-blueGray rounded hover:bg-custom-blueGray"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

const TurnoTable = ({ refreshKey }: { refreshKey: number }) => {
    const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReservacionId, setSelectedReservacionId] = useState<ID | null>(null);

    const [proximosTurnosPage, setProximosTurnosPage] = useState(1);
    const [historialTurnosPage, setHistorialTurnosPage] = useState(1);
    const itemsPerPage = 5;

    const cancelarTurno = async (id: ID) => {
        try {
            setReservaciones((prev) =>
                prev.map((reservacion) =>
                    reservacion.appointment_id === id.appointment_id &&
                    reservacion.patient_id === id.patient_id
                        ? { ...reservacion, state: "cancelado" }
                        : reservacion
                )
            );

            const response = await fetch(`http://localhost:3000/api/cancelReservation`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al cancelar el turno");
            }

            setModalOpen(false);
        } catch (err: any) {
            console.error("Error al cancelar el turno:", err);

            setReservaciones((prev) =>
                prev.map((reservacion) =>
                    reservacion.appointment_id === id.appointment_id &&
                    reservacion.patient_id === id.patient_id
                        ? { ...reservacion, state: "pendiente" }
                        : reservacion
                )
            );

            setError(err.message || "Error desconocido");
        }
    };

    useEffect(() => {
        const fetchReservaciones = async () => {
            if (!session?.user?.email) {
                setError("No se encontró el email del usuario.");
                setLoading(false);
                return;
            }

            try {
                const email = session.user.email;

                const response = await fetch(
                    `http://localhost:3000/api/getAllReservations?email=${email}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al cargar los datos");
                }

                const data = await response.json();
                setReservaciones(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchReservaciones();
    }, [session?.user?.email, refreshKey]);

    if (loading) {
        return <div className="text-center">Cargando...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    const proximosTurnos = reservaciones.filter((r) => r.state === "pendiente");
    const historialTurnos = reservaciones.filter(
        (r) => r.state === "cancelado" || r.state === "realizado"
    );

    const renderTable = (data: Reservacion[], currentPage: number, onPageChange: (page: number) => void, showCancel: boolean) => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const currentData = data.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        return (
            <div className="flex flex-col justify-between h-full">
                <div className=" overflow-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Profesional</TableHead>
                                <TableHead>Especialidad</TableHead>
                                <TableHead>Estado</TableHead>
                                {showCancel && <TableHead>Cancelar Turno</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length > 0 ? (
                                currentData.map((reservacion) => (
                                    <TableRow key={reservacion.appointment_id}>
                                        <TableCell>
                                        {new Date(reservacion.Appointment.date).toLocaleDateString("es-ES", {
                                            timeZone: "UTC",
                                        })}
                                        </TableCell>                                        
                                        <TableCell>{reservacion.Appointment.hour}</TableCell>
                                        <TableCell>{`${reservacion.Appointment.Professional.User.name} ${reservacion.Appointment.Professional.User.lastName}`}</TableCell>
                                        <TableCell>{reservacion.Appointment.Professional.specialty}</TableCell>
                                        <TableCell>{reservacion.state}</TableCell>
                                        {showCancel && (
                                            <TableCell>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReservacionId({
                                                            patient_id: reservacion.patient_id,
                                                            appointment_id: reservacion.appointment_id,
                                                        });
                                                        setModalOpen(true);
                                                    }}
                                                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                                                >
                                                    Cancelar
                                                </button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No hay datos disponibles
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Controles de paginación */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        className="px-4 py-2 bg-gray-300 rounded mr-2"
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>
                    <button
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        className="px-4 py-2 bg-gray-300 rounded ml-2"
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className=" h-2/4">
                <h2 className="text-xl font-semibold mb-4">Próximos Turnos</h2>
                {renderTable(proximosTurnos, proximosTurnosPage, setProximosTurnosPage, true)}
            </div>

            <div className="h-2/4">
                <h2 className="text-xl font-semibold mt-8 mb-4">Historial de Turnos</h2>
                {renderTable(historialTurnos, historialTurnosPage, setHistorialTurnosPage, false)}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={() => {
                    if (selectedReservacionId) {
                        cancelarTurno(selectedReservacionId);
                    }
                }}
            />
        </div>
    );
};

export default TurnoTable;
