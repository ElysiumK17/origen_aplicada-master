'use client'
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {RutineGenerate} from "@/actions/rutine_generate"
import { useSession } from "next-auth/react";


const WorkScheduleModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("08");
  const [endTime, setEndTime] = useState("16");
  const [shiftTime, setShiftTime] = useState("15");
  const [startDate, setStartDate] = useState(""); // Fecha de inicio en formato string (para Input)
  const [endDate, setEndDate] = useState(""); // Fecha de fin en formato string (para Input)
  const [result, setResult] = useState(null); // Resultado de la API
  const session = useSession()
  const emailProfessional = session.data?.user.email || ""

  const days = ["L", "M", "X", "J", "V"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  

  const handleSubmit = async () => {
    try {
      // Convertir cadenas de fechas a objetos Date
      const fechaInicio = new Date(`${startDate}T00:00:00`); // Aseguramos inicio del día
      const fechaFin = new Date(`${endDate}T23:59:59`); // Aseguramos fin del día
  
      // Validar que las fechas sean correctas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        alert("Por favor, selecciona fechas válidas.");
        return;
      }
  
      // Validar rango de fechas
      if (fechaInicio > fechaFin) {
        alert("La fecha de inicio no puede ser mayor que la fecha de fin.");
        return;
      }
  
      const intervaloMinutos = parseInt(shiftTime, 10);
      const horaInicio = parseInt(startTime, 10);
      const horaFin = parseInt(endTime, 10);
  
      // Mapear los días seleccionados (e.g., "L", "M") a valores numéricos (e.g., 1, 2)
      const diasSeleccionados = selectedDays.map((day) => {
        const dayMap: Record<string, number> = { L: 1, M: 2, X: 3, J: 4, V: 5 };
        return dayMap[day];
      });
  
      // Enviar al backend los parámetros con los días seleccionados
      const response = await RutineGenerate(
        fechaInicio,
        fechaFin,
        intervaloMinutos,
        horaInicio,
        horaFin,
        diasSeleccionados,
        emailProfessional // Pasar los días seleccionados
      );
  
      if (!response) {
        throw new Error("Error al generar intervalos");
      }
  
      setIsOpen(false);
      // setResult(response); // Actualizar el estado con el resultado
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al procesar tu solicitud.");
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full text-left px-4 py-2 bg-custom-orange text-center text-white rounded-md hover:bg-opacity-80">
          Configurar Jornada Laboral
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-custom-blueGray">Jornada Laboral</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-custom-blueGray">Selecciona tus días laborales</p>
            <div className="flex space-x-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-full ${
                    selectedDays.includes(day)
                      ? "bg-custom-blueGray text-white"
                      : "bg-custom-lightGray text-custom-blueGray"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-custom-blueGray">Selecciona el rango de fechas</p>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-custom-blueGray"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-2 border border-custom-blueGray"
            />
          </div>
          <div>
            <p className="text-custom-blueGray">Selecciona tu horario laboral</p>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-16 border border-custom-blueGray"
                min="0"
                max="24"
              />
              <span className="text-custom-blueGray">a</span>
              <Input
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-16 border border-custom-blueGray"
                min="0"
                max="24"
              />
            </div>
          </div>
          <div>
            <p className="text-custom-blueGray">Selecciona el tiempo de turno (en minutos)</p>
            <Select value={shiftTime} onValueChange={setShiftTime}>
              <SelectTrigger className="w-full border border-custom-blueGray">
                <SelectValue placeholder="Selecciona un tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            className="bg-red-500 text-white hover:bg-opacity-80"
            onClick={() => setIsOpen(false)} // Cerrar el modal al cancelar
          >
            Cancelar
          </Button>
          <Button
            className="border border-custom-blueGray bg-white-300 text-custom-blueGray hover:bg-custom-blueGray hover:text-white transition duration-300"
            onClick={handleSubmit}
          >
            Confirmar
          </Button>
        </DialogFooter>
  
        {result && (
          <div className="mt-4 p-4 bg-custom-lightGray rounded">
            <h3 className="font-bold text-custom-blueGray">Resultados Generados</h3>
            <pre className="text-custom-blueGray">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
  
};

export default WorkScheduleModal;