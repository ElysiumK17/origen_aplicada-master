import React, { useState, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

interface TypeIdCard {
    id_number: string;
}

interface User {
    id: string;
    email: string;
    lastName: string;
    name: string;
    phone_number: string;
    state: boolean;
    TypeIdCard: TypeIdCard;
}

interface Patient {
    id: string;
    User: User;
    state: string;
    registration_date: Date;
}

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold">¿Está seguro?</h2>
                <p className="mt-4">¿Desea desactivar la cuenta?</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Borrar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TurnoTable = ({
    refreshKey,
    onTurnoCreated,
}: {
    refreshKey: number;
    onTurnoCreated: () => void;
}) => {
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAction = async (id: string, action: "activate" | "deactivate") => {
        setIsLoading(true);
        try {
            // Actualiza el estado localmente para un feedback visual inmediato
            setPacientes((prev) =>
                prev.map((paciente) =>
                    paciente.User.id === id
                        ? { ...paciente, state: action === "activate" ? "activo" : "inactivo" }
                        : paciente
                )
            );

            const response = await fetch("http://localhost:3000/api/AdminApi/ReactivateRole", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, action, role: "patient" }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al actualizar el estado");
            }

            onTurnoCreated(); // Refresca la tabla después de la acción
            setModalOpen(false);
        } catch (err: any) {
            console.error("Error al actualizar el estado:", err);
            setError(err.message || "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchPacientes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/AdminApi/getPatients");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al cargar los datos");
                }
                const data = await response.json();

                const validData = data.map((patient: Patient) => ({
                    ...patient,
                    User: {
                        ...patient.User,
                        TypeIdCard: patient.User.TypeIdCard || { id_number: "N/A" },
                    },
                }));
                setPacientes(validData);
            } catch (err: any) {
                setError(err.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, [refreshKey]);

    const paginatedData = pacientes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((paciente) => (
                        <TableRow key={paciente.id}>
                            <TableCell>{`${paciente.User.name} ${paciente.User.lastName}`}</TableCell>
                            <TableCell>{paciente.User.TypeIdCard.id_number}</TableCell>
                            <TableCell>{paciente.User.phone_number}</TableCell>
                            <TableCell>{paciente.state ? "Activo" : "Inactivo"}</TableCell>
                            <TableCell>
                                {paciente.state ? (
                                    <button
                                        onClick={() => {
                                            setSelectedPatientId(paciente.User.id);
                                            setModalOpen(true);
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Borrar
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () =>
                                            await handleAction(paciente.User.id, "activate")
                                        }
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        Reactivar
                                    </button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center mt-4 space-x-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="px-4 py-2">{currentPage}</span>
                <button
                    disabled={currentPage * itemsPerPage >= pacientes.length}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={async () => {
                    if (selectedPatientId) {
                        await handleAction(selectedPatientId, "deactivate");
                    }
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default TurnoTable;
