import React from "react";

export const LocalizacionItem = ({ localizacion, seleccionada, onSeleccionar, cantidad }) => (
  <div
    className={`localizacion-item ${seleccionada ? "seleccionado" : ""}`}
    onClick={() => onSeleccionar(localizacion.id)}
  >
    <span className="nombre">{localizacion.name}</span>
    <span className="cantidad">{cantidad} dispositivos</span>
  </div>
);

