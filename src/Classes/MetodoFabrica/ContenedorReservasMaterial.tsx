import React, { useEffect } from 'react';
import { Button, Col, Row, Modal } from 'react-bootstrap';
import ComponenteReservaMaterial from '../../Components/ComponenteReservaMaterial';
import { useState } from 'react';
import Contenedor from './Contenedor';
import { useGeneral } from '../../Utils/GeneralContext';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;
class ContenedorReservasMaterial extends Contenedor {
  render(): JSX.Element {
    const [materiales, setMateriales] = useState<any[]>([]);
    const tipoDeCliente = localStorage.getItem('tipoUsuario');
    const email = localStorage.getItem('email');

    const [show, setShow] = useState(false);
    const [showCalificacion, setShowCalificacion] = useState(false);
    const [tipoReserva, setTipoReserva] = useState('');
    const handleCloseCalificar = () => setShow(false);

    const [material, setMaterial] = useState<any>(null);
    const handleShowCalificar = (material: any) => {
      setShow(true);
      setMaterial(material);
    };
    const handleCloseCalificacion = () => setShowCalificacion(false);
    const handleShowCalificacion = (material: any) => {
      setShowCalificacion(true);
      setMaterial(material);
    };

    const [calificacion, setCalificacion] = useState<number | null>(null);
    const [comentario, setComentario] = useState<string>('');

    useEffect(() => {
      obtenerMateriales();
    }, []);

    const obtenerMateriales = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservas-material/byEmail/${email}`);
        if (!response.ok) throw new Error('Error al obtener materiales reservados');
        const json = await response.json();
        setMateriales(json);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const { handleShow, setHandleShow } = useGeneral();

    const handleDelete = async (material: any) => {
      const confirmDelete = window.confirm(
        `¿Estás seguro de que quieres eliminar el material "${material.material.nombre}"?`
      );
      if (!confirmDelete) return;

      try {
        const response = await fetch(`${API_BASE_URL}/materiales/eliminar/${material.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Error al eliminar el material');

        setMateriales(materiales.filter((m) => m.id !== material.id));
      } catch (error) {
        console.error('Error al eliminar el material:', error);
      }
    };
    const handleCalificar = async (material: any, calificacion: any, comentario: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservas-material/calificar/${material.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            calificacion,
            comentario,
          }),
        });
        if (!response.ok) throw new Error('Error al calificar el material');

        // Actualizar el estado del material
        setMateriales((prev) =>
          prev.map((m) => (m.id === material.id ? { ...m, calificacion, comentario } : m))
        );
      } catch (error) {
        console.error('Error al calificar el material:', error);
      }
    };

    const Cartas = materiales.map((data, index) => (
      <Col key={index} xs="12" sm="6" md="4" lg="3" className="text-center mt-3">
        <div onClick={() => handleShow(data)}>
          <ComponenteReservaMaterial
            nombre={data.material.nombre}
            cantidad={data.cantidad}
            fecha={data.fecha}
            fechaLimite={data.fechaLimite}
            horaInicio={data.horaInicio}
            horaFin={data.horaFin}
            estado={data.estado}
          />
        </div>
        {data.estado === 'Pendiente' && (
          <Button variant="danger" className="mb-4 mt-1" onClick={() => handleDelete(data)}>
            Eliminar
          </Button>
        )}
        {data.estado === 'Devuelto' && data.calificacion === null && (
          <Button variant="primary" className="mb-4 mt-1" onClick={() => handleShowCalificar(data)}>
            Calificar
          </Button>
        )}
        {data.calificacion !== null && (
          <Button
            variant="secondary"
            className="mb-4 mt-1"
            onClick={() => handleShowCalificacion(data)}
          >
            Mostrar calificación
          </Button>
        )}
      </Col>
    ));

    return (
      <>
        <div className="align-self-start ps-5 pt-4 mb-3">
          <h3 data-testid="Materiales para reservar">Tus Materiales Reservados:</h3>
        </div>
        <Row
          className="align-items-flex-start"
          onClick={() => {
            setTipoReserva('material');
          }}
        >
          {materiales.length > 0 ? Cartas : <p className="h4 sub">No hay materiales disponibles</p>}
        </Row>

        <Modal show={show} onHide={handleCloseCalificar}>
          <Modal.Header closeButton>
            <Modal.Title>Calificar Material</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Cómo calificarías el material{' '}
              <strong>{material?.material?.nombre || 'Desconocido'}</strong>?
            </p>

            <div className="mb-3">
              <label htmlFor="calificacion" className="form-label">
                Calificación
              </label>
              <select
                id="calificacion"
                className="form-select"
                value={calificacion ?? ''}
                onChange={(e) => setCalificacion(Number(e.target.value))}
              >
                <option value="" disabled>
                  Selecciona una calificación
                </option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="comentario" className="form-label">
                Comentario
              </label>
              <textarea
                id="comentario"
                className="form-control"
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe un comentario breve..."
              ></textarea>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                handleCloseCalificar();
                setCalificacion(null);
                setComentario('');
              }}
            >
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                console.log('Calificación:', calificacion);
                console.log('Comentario:', comentario);
                handleCalificar(material, calificacion, comentario);
                handleCloseCalificar();
                setCalificacion(null);
                setComentario('');
              }}
            >
              Calificar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCalificacion} onHide={handleCloseCalificacion}>
          <Modal.Header closeButton>
            <Modal.Title>Calificación del Material</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Material: <strong>{material?.material?.nombre || 'Desconocido'}</strong>
            </p>
            <p>Calificación: {material?.calificacion || 'No calificado'}</p>
            <p>Comentario: {material?.comentario || 'No hay comentario disponible'}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCalificacion}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default ContenedorReservasMaterial;
