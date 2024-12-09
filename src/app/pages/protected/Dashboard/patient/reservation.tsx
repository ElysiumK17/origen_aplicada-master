import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from "next-auth/react";
import { format, startOfDay, isBefore } from "date-fns";

type Profesional = {
  id: string;
  name: string;
  email: string;
  availableTurns: Turno[];
  photo: string;
};

type Turno = {
  date: string;
  hours: Hora[];
};

type Hora={
  id: string,
  hour: string
}

type Especialidad = {
  specialty: string;
  professionals: Profesional[];
};

const TurnoModal = ({ isOpen, onClose, onTurnoCreated }: { isOpen: boolean; onClose: () => void ; onTurnoCreated: () => void}) => {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | undefined>();
  const [filteredProfessionals, setFilteredProfessionals] = useState<Profesional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Profesional | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableHours, setAvailableHours] = useState<Hora[]>([]);
  const [selectedHour, setSelectedHour] = useState<Hora | undefined>();
  const session = useSession();
  const email = session?.data?.user.email;
  // Fetch especialidades y profesionales con turnos disponibles
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await fetch("/api/reservationApi");
        const data = await response.json();
        if (Array.isArray(data)) {
          setEspecialidades(data);
        } else {
          console.error("La respuesta no es un arreglo:", data);
          setEspecialidades([]);
        }
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
        setEspecialidades([]);
      }
    };
    fetchEspecialidades();
  }, []);

  // Filtrar los profesionales por especialidad seleccionada
  useEffect(() => {
    const especialidad = especialidades.find((esp) => esp.specialty === selectedEspecialidad);
    setFilteredProfessionals(especialidad ? especialidad.professionals : []);
    setSelectedProfessional(undefined);
  }, [selectedEspecialidad, especialidades]);

  // Obtener horarios disponibles del profesional seleccionado y la fecha
  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      const dateStr = format(startOfDay(selectedDate), "yyyy-MM-dd");

      const availableTurns = selectedProfessional.availableTurns.find(
        (turn) => turn.date === dateStr
      );

      console.log(availableTurns?.hours)
      const hours = availableTurns?.hours || [];
      setAvailableHours(hours);
      console.log(availableHours)
      // setAvailableHours([
      //   { id: "cm4bwf4gj000lj34e030ac3nw", hour: "08:00" },
      //   {hour: '9:0', id: 'cm4bwf4gj000rj34eczwpubwm'},

      // ]);
      setSelectedHour(undefined); // Reiniciar la hora seleccionada
    } else {
      setAvailableHours([]);
    }
  }, [selectedProfessional, selectedDate]);

  const handleConfirmar = async () => {
    if (selectedProfessional && selectedDate && selectedHour) {
      const id = selectedHour.id;
      const [hour, minute] = selectedHour.hour.split(":");
      const formattedHour = hour.padStart(2, "0");
      const formattedMinute = minute.padStart(2, "0");
  
      // La fecha ya está en UTC, combinarla con la hora
      const dateStr = format(selectedDate, "yyyy-MM-dd"); // selectedDate ya está en UTC
      const dateTime = `${dateStr}T${formattedHour}:${formattedMinute}:00Z`; // Agregar 'Z' para UTC
  
      const payload = {
        appointment_id: id,
        email, // Cambiar por el ID real del paciente logueado
        date: dateTime, // Fecha y hora en UTC
        state: "pendiente", // Estado inicial
      };
  
      console.log("Payload enviado:", payload);
  
      try {
        const response = await fetch("/api/createReservation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log("Reserva creada exitosamente:", data);
          onTurnoCreated();
          onClose(); // Cerrar el modal
        } else {
          console.error("Error al crear la reserva:", data.error);
          alert(data.error || "Hubo un error al crear la reserva.");
        }
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error al conectar con el servidor.");
      }
    } else {
      console.error("Faltan datos para confirmar la reserva.");
    }
  };
  
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl"> {/* Clase para ajustar el tamaño */}

        <DialogHeader>
          <DialogTitle>Añadir Turno</DialogTitle>
        </DialogHeader>

        {/* Selección de Especialidades y Profesionales */}
        <div className="mb-4 flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/2">
            <label className="block mb-2 font-medium">Especialidad</label>
            <Select onValueChange={setSelectedEspecialidad}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {especialidades.map((esp) => (
                  <SelectItem key={esp.specialty} value={esp.specialty}>
                    {esp.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:w-1/2">
            <label className="block mb-2 font-medium">Profesional</label>
            <Select
              onValueChange={(id) =>
                setSelectedProfessional(filteredProfessionals.find((prof) => prof.id === id))
              }
              disabled={!filteredProfessionals.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un profesional" />
              </SelectTrigger>
              <SelectContent>
              {filteredProfessionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  <div className="flex items-center gap-2">
                    {/* Mostrar la imagen del profesional */}
                    <img
                      src={prof.photo} // Usar la cadena Base64 o la URL como fuente de la imagen
                      alt={`${prof.name}'s photo`}
                      className="w-8 h-8 rounded-full" // Estilos para la imagen
                    />
                    {/* Mostrar el nombre del profesional */}
                    <span>{prof.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendario y Horarios Disponibles */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Calendario */}
          <div className={`lg:w-1/2 ${!selectedEspecialidad || !selectedProfessional ? "opacity-50" : ""}`}>
            <label className="block mb-2 font-medium">Selecciona una fecha</label>
            <Calendar
              mode="single"
              selected={selectedDate ? startOfDay(selectedDate) : undefined}
              onSelect={(date) => {
                const normalizedDate = date ? startOfDay(date) : null;
                console.log("Date Selected:", date);
                console.log("Normalized Date:", normalizedDate);
                setSelectedDate(normalizedDate);
              }}
              disabled={(date) => {
                const dayOfWeek = date.getDay();
                return (
                  !selectedEspecialidad ||
                  !selectedProfessional ||
                  isBefore(startOfDay(date), startOfDay(new Date())) ||
                  dayOfWeek === 0 || // Domingos
                  dayOfWeek === 6    // Sábados
                );
              }}
            />
            {!selectedEspecialidad || !selectedProfessional && (
              <p className="text-sm">Selecciona una especialidad y un profesional para habilitar el calendario.</p>
            )}
          </div>

          {/* Horarios */}
          <div className="lg:w-1/2">
            <label className="block mb-2 font-medium">Horarios disponibles</label>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[300px]">
              {availableHours.length > 0 ? (
                availableHours.map((hour) => (
                  <Button
                    key={hour.id}
                    variant="outline"
                    className={hour === selectedHour ? "bg-blue-500 text-white" : ""}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour.hour}
                  </Button>
                ))
              ) : (
                <p className="col-span-4 text-center">No hay horarios disponibles.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
        <Button
          className="bg-red-500 hover:bg-red-600 text-white "
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
        onClick={handleConfirmar}
        disabled={!selectedHour}
        className={`bg-custom-blueGray text-white hover:bg-custom-blueGray ${
          !selectedHour
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-opacity-80"
        }`}
      >
        Confirmar
      </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TurnoModal;