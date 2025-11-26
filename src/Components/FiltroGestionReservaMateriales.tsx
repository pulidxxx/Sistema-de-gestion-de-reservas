import React, { useState } from "react";
import "./FiltroReservas.css"; // Reutiliza los estilos modernos

export default function FiltroGestionReservas({ onFiltrosChange }) {
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const handleChange = (campo, valor) => {
    if (campo === "email") setFiltroEmail(valor);
    if (campo === "id") setFiltroId(valor);
    if (campo === "estado") setFiltroEstado(valor);
    onFiltrosChange({
      email: campo === "email" ? valor : filtroEmail,
      id: campo === "id" ? valor : filtroId,
      estado: campo === "estado" ? valor : filtroEstado,
    });
  };

  const limpiarFiltros = () => {
    setFiltroEmail("");
    setFiltroId("");
    setFiltroEstado("");
    onFiltrosChange({ email: "", id: "", estado: "" });
  };

  return (
    <div className="filtro-reservas">
      <div className="filtro-header">
        <div className="filtro-title">
          <span className="filtro-icon">🔎</span>
          <h3>Filtrar Reservas</h3>
        </div>
        <div className="filtro-subtitle">Busca reservas por usuario, ID o estado</div>
      </div>
      <div className="filtro-content">
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-label-icon">📧</span>
            Email del usuario
          </label>
          <input
            className="form-control modern-select"
            type="text"
            placeholder="ej. usuario@email.com"
            value={filtroEmail}
            onChange={e => handleChange("email", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-label-icon">🆔</span>
            ID de reserva
          </label>
          <input
            className="form-control modern-select"
            type="text"
            placeholder="ej. 5"
            value={filtroId}
            onChange={e => handleChange("id", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-label-icon">📋</span>
            Estado
          </label>
          <select
            className="form-control modern-select"
            value={filtroEstado}
            onChange={e => handleChange("estado", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Entregado">Entregado</option>
            <option value="Devuelto">Devuelto</option>
          </select>
        </div>
        <div className="filter-actions">
          <button
            type="button"
            className="clear-filters-btn"
            onClick={limpiarFiltros}
          >
            <span className="btn-icon">🔄</span>
            <span>Limpiar Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
}