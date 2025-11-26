import React, { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { Col, Card, Badge, Button } from "react-bootstrap";
import { GeneralProvider } from "../Utils/GeneralContext";
import FiltroGestionReservas from "../Components/FiltroGestionReservas";
import "../Styles/Gestion.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function GestionReserva() {
  const [reservas, setReserva] = useState([]);
  const [filtros, setFiltros] = useState({ email: "", id: "", estado: "" });

  // Modal states
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [mostrarModalObs, setMostrarModalObs] = useState(false);
  const [textoObs, setTextoObs] = useState("");

  const obtenerReservas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas`);
      if (!response.ok)
        throw new Error("Error al obtener espacios reservados");
      const data = await response.json();
      setReserva(data);
    } catch (error) {
      console.error("Error al obtener espacios reservados:", error);
    }
  };

  useEffect(() => {
    obtenerReservas();
  }, []);

  // Filtrado visual
  const reservasFiltradas = reservas.filter((reserva) => {
    const coincideEmail =
      filtros.email === "" ||
      reserva.usuario.email.toLowerCase().includes(filtros.email.toLowerCase());
    const coincideId = filtros.id === "" || reserva.id.toString() === filtros.id;
    const coincideEstado =
      filtros.estado === "" || reserva.estado.toLowerCase() === filtros.estado.toLowerCase();
    return coincideEmail && coincideId && coincideEstado;
  });

  // Traducción de estados para mostrar y guardar
  const mostrarEstado = (estado) => {
    if (estado === "Activa" || estado === "activa") return "Activa";
    if (estado === "Completada" || estado === "completada") return "Completada";
    // Compatibilidad con datos antiguos
    if (estado === "Entregado" || estado === "entregado") return "Activa";
    if (estado === "Devuelto" || estado === "devuelto") return "Completada";
    return estado;
  };

  const colorEstado = (estado) => {
    if (mostrarEstado(estado) === "Activa") return "warning";
    if (mostrarEstado(estado) === "Completada") return "success";
    return "secondary";
  };

  return (
    <GeneralProvider>
      <Container fluid className="align-items-center m-0 p-0 containerR">
        <Row className="width-100vw mt-0">
          <Col xs={{ span: 8, offset: 2 }}>
            <Row className="p-5">
              <Col className="centered" data-testid="logo"></Col>
              <Col className="titleR">
                <br />
                <h1>Gestión de Reservas</h1>
                <p className="titleRL text-muted">
                  Visualiza y administra todas las reservas del sistema
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="px-5">
          <Col md={{ span: 10, offset: 1 }}>
            <h4 className="text-center">
              <strong>Instrucciones:</strong> Usa los filtros para buscar reservas por usuario, ID o estado.
            </h4>
            <FiltroGestionReservas onFiltrosChange={setFiltros} estados={["Activa", "Completada"]} />
          </Col>
        </Row>
        <Row className="materiales-lista px-5">
          {reservasFiltradas.length === 0 && (
            <Col className="text-center mt-4">
              <p className="h5 text-muted">No hay reservas que coincidan con los filtros.</p>
            </Col>
          )}
          {reservasFiltradas.map((reserva, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
              <Card className="mb-3 creative-card" style={{ width: "100%", minWidth: "270px", maxWidth: "320px" }}>
                <Card.Header className="text-center" style={{ background: "#4f8cff", color: "#fff", fontWeight: 700 }}>
                  <span>Reserva #{reserva.id}</span>
                </Card.Header>
                <Card.Body>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      background: "#e3edff",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.7rem"
                    }}>
                      🗓️
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#4f8cff" }}>{reserva.calendario.espacio.nombre}</div>
                      <div style={{ fontSize: "0.95rem", color: "#2d3a4b" }}>
                        {reserva.calendario.fecha} <br />
                        {reserva.calendario.horaInicio} - {reserva.calendario.horaFin}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div style={{ fontSize: "0.97rem" }}>
                    <strong>Usuario:</strong> {reserva.usuario.nombre} <br />
                    <strong>Email:</strong> {reserva.usuario.email}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <Badge
                      bg={colorEstado(reserva.estado)}
                      style={{
                        fontSize: "0.95rem",
                        padding: "7px 16px",
                        borderRadius: "12px",
                        letterSpacing: "1px",
                        textTransform: "uppercase"
                      }}
                    >
                      {mostrarEstado(reserva.estado)}
                    </Badge>
                  </div>
                </Card.Body>
                <div className="text-center" style={{ paddingBottom: "20px" }}>
                  {mostrarEstado(reserva.estado) !== "Completada" && (
                    <Button
                      variant="primary"
                      style={{ width: "200px", boxShadow: "0 0 12px rgba(36, 63, 198, 0.51)" }}
                      className="actualizarEstado"
                      onClick={() => {
                        setReservaSeleccionada(reserva);
                        setNuevoEstado(mostrarEstado(reserva.estado));
                        setMostrarModal(true);
                      }}
                    >
                      Actualizar estado
                    </Button>
                  )}
                  {mostrarEstado(reserva.estado) === "Completada" && (
                    <Button
                      variant="secondary"
                      style={{ width: "200px", boxShadow: "0 0 12px rgba(94, 95, 97, 0.53)" }}
                      className="observaciones"
                      onClick={() => {
                        setReservaSeleccionada(reserva);
                        setTextoObs(reserva.observacionesEntrega || "");
                        setMostrarModalObs(true);
                      }}
                    >
                      Observaciones
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        {/* Modal: Actualizar Estado */}
        {mostrarModal && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h5 className="titleUp text-center">
                Actualizar estado para la reserva #{reservaSeleccionada?.id}
              </h5>
              <select
                value={nuevoEstado}
                className="selectUp form-select"
                onChange={(e) => setNuevoEstado(e.target.value)}
              >
                <option value="">Seleccione el estado</option>
                <option value="activa">Activa</option>
                <option value="completada">Completada</option>
              </select>
              <div className="mt-3 d-flex justify-content-evenly">
                <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      // Guarda el estado como Activa/Completada
                      const response = await fetch(
                        `${API_BASE_URL}/reservas/${reservaSeleccionada.id}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ estado: nuevoEstado }),
                        }
                      );
                      if (!response.ok) throw new Error("Error al actualizar el estado");
                      await obtenerReservas();
                      setMostrarModal(false);
                      alert("Estado actualizado correctamente");
                    } catch (error) {
                      console.error("Error actualizando estado:", error);
                      alert("Error al actualizar el estado: " + error);
                    }
                  }}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Observaciones */}
        {mostrarModalObs && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h5 className="titleUpCom text-center">
                Observaciones para la reserva #{reservaSeleccionada?.id}
              </h5>
              <textarea
                className="form-control mt-3"
                rows={4}
                value={textoObs}
                onChange={(e) => setTextoObs(e.target.value)}
              />
              <div className="mt-3 d-flex justify-content-evenly">
                <Button variant="secondary" onClick={() => setMostrarModalObs(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `${API_BASE_URL}/reservas/${reservaSeleccionada.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ observacionesEntrega: textoObs }),
                        }
                      );
                      if (!res.ok) throw new Error("Error guardando observación");
                      await obtenerReservas();
                      setMostrarModalObs(false);
                      alert("Observación guardada correctamente");
                    } catch (err) {
                      console.error("Error guardando observación:", err);
                      alert("Error guardando observación: " + err);
                    }
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}
        <br />
        <br />
      </Container>
    </GeneralProvider>
  );
}

export default GestionReserva;