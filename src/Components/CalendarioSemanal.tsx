import React, { useState, useEffect } from 'react';
import ConfirmacionReserva from './ConfirmacionReserva';
import './CalendarioSemanal.css';

interface Props {
  idEspacio: number;
  nombreEspacio: string;
}

interface ReservaInfo {
  id: number;
  usuarioNombre: string;
  email: string;
}

interface DisponibilidadSlot {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  reservas?: ReservaInfo[];
  calendarioId: number;
  docenteAsignado: boolean;
}

interface DisponibilidadDia {
  fecha: string;
  dia: string;
  disponibilidad: DisponibilidadSlot[];
}

interface FechaSemana {
  fecha: string;
  dia: string;
  fechaCompleta: Date;
}

interface ReservaSeleccionada {
  espacioId: number;
  nombreEspacio: string;
  fecha: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  calendarioId: number;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CalendarioSemanal: React.FC<Props> = ({ idEspacio, nombreEspacio }) => {
  const [semanaActual, setSemanaActual] = useState(0);
  const [disponibilidadSemana, setDisponibilidadSemana] = useState<DisponibilidadDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaSeleccionada | null>(null);

  const horariosBase = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const obtenerFechasSemana = (semanaOffset: number = 0): FechaSemana[] => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);

    const diaActual = hoy.getDay();
    const diasHastaLunes = diaActual === 0 ? -6 : 1 - diaActual;
    inicioSemana.setDate(hoy.getDate() + diasHastaLunes + semanaOffset * 7);

    const fechasSemana: FechaSemana[] = [];
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      fechasSemana.push({
        fecha: fecha.toISOString().split('T')[0],
        dia: diasSemana[i],
        fechaCompleta: fecha,
      });
    }
    return fechasSemana;
  };

  const cargarDisponibilidadSemana = async () => {
    try {
      setLoading(true);
      setError(null);
      const fechasSemana = obtenerFechasSemana(semanaActual);
      const disponibilidadPromesas = fechasSemana.map(async ({ fecha, dia }) => {
        const response = await fetch(
          `${API_BASE_URL}/reservas/disponibilidad/${idEspacio}?fecha=${fecha}`
        );
        if (!response.ok) throw new Error('Error al cargar disponibilidad');
        const data = await response.json();
        return {
          fecha,
          dia,
          disponibilidad: data.disponibilidad,
        };
      });
      const resultados = await Promise.all(disponibilidadPromesas);
      setDisponibilidadSemana(resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idEspacio) {
      cargarDisponibilidadSemana();
    }
  }, [idEspacio, semanaActual]);

  const handleReservarHorario = async (
    fecha: string,
    dia: string,
    horaInicio: string,
    horaFin: string,
    calendarioId: number
  ) => {
    setReservaSeleccionada({
      espacioId: idEspacio,
      nombreEspacio,
      fecha,
      dia,
      horaInicio,
      horaFin,
      calendarioId,
    });
    setShowModal(true);
    return true;
  };
  //Calendario

  const [capacidadEspacio, setCapacidad] = useState('');
  const [idCalendarioCreado, setIdCalendario] = useState(null);
  const obtenerCapacidaEspacio = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/espacios/${idEspacio}`);
      if (!response.ok) throw new Error('Error el epacio');
      const json = await response.json();
      const espacio = json;
      return espacio.capacidad;
    } catch (error) {
      console.error('Error al obtener la capacidad del espacio: ', error);
    }
  };

  const handleCrearCalendario = async (fecha: string, horaInicio: string, horaFin: string) => {
    try {
      const cantidad = await obtenerCapacidaEspacio();
      const response = await fetch(`${API_BASE_URL}/calendario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: fecha,
          horaInicio: horaInicio,
          horaFin: horaFin,
          capacidad: cantidad,
          disponibilidad: true,
          espacioId: idEspacio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const idCalendario = data.id;
        setIdCalendario(idCalendario);
        return idCalendario;
        //await cargarDisponibilidadSemana();
      } else {
        const error = await response.json();
        alert(`Error calendario: ${error.error}`);
      }
    } catch (err) {
      alert('Error al crear el calendario');
    }
  };

  const handleConfirmarReserva = async () => {
    if (!reservaSeleccionada) return;
    try {
      const response = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarioId: reservaSeleccionada.calendarioId,
          usuarioId: localStorage.getItem('email'),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setReservaSeleccionada(null);
        await cargarDisponibilidadSemana();
        alert('Reserva creada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Error al crear la reserva');
    }
  };

  const cambiarSemana = (direccion: number) => {
    setSemanaActual((prev) => Math.max(0, prev + direccion));
  };

  const formatearRangoSemana = () => {
    const fechas = obtenerFechasSemana(semanaActual);
    const inicio = fechas[0].fechaCompleta.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
    const fin = fechas[5].fechaCompleta.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${inicio} - ${fin}`;
  };

  if (error) {
    return (
      <div className="calendario-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Error al cargar el calendario</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => cargarDisponibilidadSemana()}>
            <span className="btn-icon">🔄</span>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const tipoUsuario = String(localStorage.getItem('tipoUsuario'));

  return (
    <>
      <div className="calendario-semanal">
        <div className="calendario-header">
          <div className="header-content">
            <div className="titulo-seccion">
              <span className="calendario-icon">📅</span>
              <div className="titulo-info">
                <h2>Disponibilidad Semanal</h2>
                <p className="espacio-nombre">{nombreEspacio}</p>
              </div>
            </div>
            <div className="fecha-rango">
              <span className="fecha-icon">🗓️</span>
              <span className="fecha-texto">{formatearRangoSemana()}</span>
            </div>
          </div>

          <div className="navegacion-semana">
            <button
              className={`nav-btn prev-btn ${semanaActual === 0 ? 'disabled' : ''}`}
              onClick={() => cambiarSemana(-1)}
              disabled={semanaActual === 0}
            >
              <span className="nav-icon">←</span>
              <span className="nav-text">Anterior</span>
            </button>
            <button className="nav-btn next-btn" onClick={() => cambiarSemana(1)}>
              <span className="nav-text">Siguiente</span>
              <span className="nav-icon">→</span>
            </button>
          </div>
        </div>

        <div className="calendario-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-content">
                <h3>Cargando calendario</h3>
                <p>Obteniendo disponibilidad semanal...</p>
              </div>
            </div>
          ) : (
            <div className="horarios-grid">
              <div className="grid-header">
                <div className="horario-header">
                  <span className="header-icon">⏰</span>
                  <span>Horario</span>
                </div>
                {disponibilidadSemana.map((dia) => (
                  <div key={dia.fecha} className="dia-header">
                    <span className="dia-nombre">{dia.dia}</span>
                    <span className="dia-fecha">
                      {new Date(dia.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid-body">
                {horariosBase.map((hora) => {
                  const horaFin = calcularHoraFin(hora);
                  return (
                    <div key={hora} className="horario-fila">
                      <div className="horario-slot">
                        <div className="hora-inicio">{hora}</div>
                        <div className="hora-separator">-</div>
                        <div className="hora-fin">{horaFin}</div>
                      </div>
                      {disponibilidadSemana.map((dia) => {
                        const slot = dia.disponibilidad.find((s) => s.horaInicio === hora);

                        const slotDateTime = new Date(`${dia.fecha}T${hora}`);
                        const ahora = new Date();
                        const esPasado = slotDateTime < ahora;

                        if (esPasado) {
                          return (
                            <div key={`${dia.fecha}-${hora}`} className="slot pasado">
                              <span className="slot-icon">⏳</span>
                              <span className="slot-text">Pasado</span>
                            </div>
                          );
                        }

                        if (!slot) {
                          return (
                            <div
                              key={`${dia.fecha}-${hora}`}
                              className="slot disponible"
                              onClick={async () => {
                                const idCalendario = await handleCrearCalendario(
                                  dia.fecha,
                                  hora,
                                  horaFin
                                );
                                await handleReservarHorario(
                                  dia.fecha,
                                  dia.dia,
                                  hora,
                                  horaFin,
                                  Number(idCalendario)
                                );
                              }}
                            >
                              <span className="slot-icon">✨</span>
                              <span className="slot-text">Disponible</span>
                            </div>
                          );
                        }

                        const idCalendario = slot.calendarioId;
                        const esDisponible =
                          tipoUsuario !== 'Profesor'
                            ? slot.disponible
                            : slot.docenteAsignado == null;

                        return (
                          <div
                            key={`${dia.fecha}-${hora}`}
                            className={`slot ${esDisponible ? 'disponible' : 'ocupado'}`}
                            onClick={async () =>
                              esDisponible &&
                              (await handleReservarHorario(
                                dia.fecha,
                                dia.dia,
                                hora,
                                horaFin,
                                idCalendario
                              ))
                            }
                          >
                            <span className="slot-icon">{esDisponible ? '✅' : '🚫'}</span>
                            <span className="slot-text">
                              {esDisponible ? 'Disponible' : 'Ocupado'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="calendario-leyenda">
            <h4>Leyenda</h4>
            <div className="leyenda-items">
              <div className="leyenda-item disponible">
                <span className="leyenda-color"></span>
                <span>Disponible</span>
              </div>
              <div className="leyenda-item ocupado">
                <span className="leyenda-color"></span>
                <span>Ocupado</span>
              </div>
              <div className="leyenda-item pasado">
                <span className="leyenda-color"></span>
                <span>Pasado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmacionReserva
        show={showModal}
        onHide={() => setShowModal(false)}
        reserva={reservaSeleccionada}
        onConfirmar={handleConfirmarReserva}
      />
    </>
  );
};

function calcularHoraFin(horaInicio: string): string {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const nuevaHora = horas + 2;
  return `${nuevaHora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

export default CalendarioSemanal;
