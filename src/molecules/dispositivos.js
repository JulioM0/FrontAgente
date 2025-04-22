import React from "react";

export const DispositivoItem = ({ dispositivo, seleccionado, onSeleccionar }) => {
    return (
      <div
        className={`dispositivo-item ${seleccionado ? "seleccionado" : ""}`}
        onClick={() => onSeleccionar(dispositivo)}
      >
        <div className="icono-dispositivo">🖥️</div>
        <div className="contenido-dispositivo">
          <h2 className="nombre-dispositivo">{dispositivo.systemName}</h2>
          <p className="organizacion-dispositivo">{dispositivo.organizationName}</p>
          <p className="ip-dispositivo">{dispositivo.publicIP}</p>
        </div>
        <div className={`estado-dispositivo ${dispositivo.offline ? "desconectado" : "conectado"}`}>
          {dispositivo.offline ? "Desconectado" : "Conectado"}
        </div>
      </div>
    );
}