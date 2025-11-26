import React, { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { Col, Card, Badge, Button } from "react-bootstrap";
import { GeneralProvider } from "../Utils/GeneralContext";
import FiltroGestionReservaMateriales from "../Components/FiltroGestionReservaMateriales";
import "../Styles/Gestion.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function GestionMateriales() {
  const [materiales, setMateriales] = useState([]);
  const [filtros, setFiltros] = useState({ email: "", id: "", estado: "" });

  // Modal states
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [mostrarModalObs, setMostrarModalObs] = useState(false);
  const [textoObs, setTextoObs] = useState("");

  const obtenerMateriales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas-material`);
      if (!response.ok)
        throw new Error("Error al obtener materiales reservados");
      const data = await response.json();
      setMateriales(data);
    } catch (error) {
      console.error("Error al obtener materiales reservados:", error);
    }
  };

  useEffect(() => {
    obtenerMateriales();
  }, []);

  // Filtrado visual igual que en GestionReservas
  const materialesFiltrados = materiales.filter((material) => {
    const coincideEmail =
      filtros.email === "" ||
      material.usuario.email.toLowerCase().includes(filtros.email.toLowerCase());
    const coincideId = filtros.id === "" || material.id.toString() === filtros.id;
    const coincideEstado =
      filtros.estado === "" || material.estado === filtros.estado;
    return coincideEmail && coincideId && coincideEstado;
  });

  return (
    <GeneralProvider>
      <Container fluid className="align-items-center m-0 p-0 containerR">
        <Row className="width-100vw mt-0">
          <Col xs={12}>
            <Row className="p-5">
              <Col className="centered" data-testid="logo"></Col>
              <Col className="titleR">
                <br />
                <h1>Gestión de Materiales</h1>
                <p className="text-muted">
                  Visualiza y administra todas las reservas de materiales del sistema
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="px-5">
          <Col md={{ span: 10, offset: 1 }}>
            <h4 className="text-center">
              <strong>Instrucciones:</strong> Usa los filtros para buscar reservas de materiales por usuario, ID o estado.
            </h4>
            <FiltroGestionReservaMateriales onFiltrosChange={setFiltros} />
          </Col>
        </Row>
        <Row className="materiales-lista px-5">
          {materialesFiltrados.length === 0 && (
            <Col className="text-center mt-4">
              <p className="h5 text-muted">No hay reservas de materiales que coincidan con los filtros.</p>
            </Col>
          )}
          {materialesFiltrados.map((material, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
              <Card className="mb-3 creative-card" style={{ width: "100%", minWidth: "270px", maxWidth: "320px" }}>
                <Card.Header className="text-center" style={{ background: "#4f8cff", color: "#fff", fontWeight: 700 }}>
                  <span>Reserva #{material.id}</span>
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
                      🧰
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#4f8cff" }}>{material.material.nombre}</div>
                      <div style={{ fontSize: "0.95rem", color: "#2d3a4b" }}>
                        {material.fecha} <br />
                        {material.horaInicio} - {material.horaFin}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div style={{ fontSize: "0.97rem" }}>
                    <strong>Usuario:</strong> {material.usuario.nombre} <br />
                    <strong>Email:</strong> {material.usuario.email}
                  </div>
                  <div style={{ fontSize: "0.97rem" }}>
                    <strong>Observaciones:</strong> {material.observacionesEntrega || "Ninguna"}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <Badge
                      bg={
                        material.estado === "Pendiente"
                          ? "warning"
                          : material.estado === "Entregado"
                          ? "success"
                          : "secondary"
                      }
                      style={{
                        fontSize: "0.95rem",
                        padding: "7px 16px",
                        borderRadius: "12px",
                        letterSpacing: "1px",
                        textTransform: "uppercase"
                      }}
                    >
                      {material.estado}
                    </Badge>
                  </div>
                </Card.Body>
                <div className="text-center" style={{ paddingBottom: "20px" }}>
                  {material.estado !== "Devuelto" && (
                    <Button
                      variant="primary"
                      style={{ width: "200px", boxShadow: "0 0 12px rgba(36, 63, 198, 0.51)" }}
                      className="actualizarEstado"
                      onClick={() => {
                        setReservaSeleccionada(material);
                        setNuevoEstado(material.estado);
                        setMostrarModal(true);
                      }}
                    >
                      Actualizar estado
                    </Button>
                  )}
                  {material.estado === "Devuelto" && (
                    <Button
                      variant="secondary"
                      style={{ width: "200px", boxShadow: "0 0 12px rgba(94, 95, 97, 0.53)" }}
                      className="observaciones"
                      onClick={() => {
                        setReservaSeleccionada(material);
                        setTextoObs(material.observacionesEntrega || "");
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
                <option value="Entregado">Entregado</option>
                <option value="Devuelto">Devuelto</option>
              </select>
              <div className="mt-3 d-flex justify-content-evenly">
                <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${API_BASE_URL}/reservas-material/estado/${reservaSeleccionada.id}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ estado: nuevoEstado }),
                        }
                      );
                      if (!response.ok) throw new Error("Error al actualizar el estado");
                      await obtenerMateriales();
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
                        `${API_BASE_URL}/reservas-material/observaciones/${reservaSeleccionada.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ observacionesEntrega: textoObs }),
                        }
                      );
                      if (!res.ok) throw new Error("Error guardando observación");
                      await obtenerMateriales();
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

export default GestionMateriales;