import React, { useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { GeneralProvider } from '../Utils/GeneralContext';
import Footer from '../Components/Footer';
import Header from '../Classes/Header/Header';
import ThemeSwitcher from '../Components/ThemeSwitcher';
import FiltroReservas from '../Components/FiltroReservas';
import { FiltrosReserva } from '../types/reserva.types';
import CalendarioSemanal from '../Components/CalendarioSemanal';
import '../Styles/Reserva.css';

const ReservaPage: React.FC = () => {
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<string | null>(null);
  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosReserva>({});

  const handleSelectEspacio = (espacioId: string | null) => {
    setEspacioSeleccionado(espacioId);
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosReserva) => {
    setFiltrosActivos(nuevosFiltros);
  };

  return (
    <GeneralProvider>
      <Container fluid className="align-items-center m-0 p-0 containerR">
        <Row className="width-100vw mt-5">
          <Col xs={{ span: 8, offset: 2 }}>
            <Row className="p-5">
              <Col className="centered" data-testid="logo"></Col>
              <Col className="titleR">
                <br />
                <h1>Sistema de Reservas</h1>
                <p className="titleRL text-muted">
                  Reserva aulas y laboratorios de forma eficiente
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="px-5 ">
          <Col md={{ span: 10, offset: 1 }}>
            <h4 className="">
              <strong>Instrucciones:</strong> Utiliza los filtros para encontrar el espacio ideal,
              selecciona una fecha y reserva el horario que necesites.
            </h4>
            <FiltroReservas
              onSelectEspacio={handleSelectEspacio}
              onFiltrosChange={handleFiltrosChange}
            />

            {espacioSeleccionado && (
              <CalendarioSemanal
                idEspacio={parseInt(espacioSeleccionado)}
                nombreEspacio={espacioSeleccionado}
              />
            )}
          </Col>
        </Row>
        <br />
        <br />
      </Container>
    </GeneralProvider>
  );
};

export default ReservaPage;
