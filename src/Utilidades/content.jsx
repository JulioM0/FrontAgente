import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
  const [localizaciones, setLocalizaciones] = useState([]);
  const [localizacionSeleccionada, setLocalizacionSeleccionada] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerLocalizaciones = async () => {
      try {
        const response = await api.get("locations");
        setLocalizaciones(response.data);
      } catch (error) {
        console.error("Error al obtener las localizaciones:", error);
      }
    };
    obtenerLocalizaciones();
  }, []);

  function formatearAtributos(clave) {
    return clave
        .replace(/_/g, " ") 
        .toLowerCase() 
        .replace(/\b\w/g, (l) => l.toUpperCase()); 
}

  useEffect(() => {
    const obtenerDispositivos = async () => {
      if (!localizacionSeleccionada) return;
      try {
        const response = await api.get(`devices?id=${localizacionSeleccionada}`);
        setDispositivos(response.data);
      } catch (error) {
        console.error("Error al obtener los dispositivos:", error);
      }
    };
    obtenerDispositivos();
  }, [localizacionSeleccionada]);

  const handleSeleccionLoc = (event) => {
    setLocalizacionSeleccionada(event.target.value);
    setDispositivos([]);
    setDispositivoSeleccionado(null);
  };

  const handleSeleccionDispositivo = (dispositivo) => {
    setDispositivoSeleccionado(dispositivo);
  };

  const cerrarModal = () => {
    setDispositivoSeleccionado(null);
  };

  return (
    <div className="Contenido">
      <h1 className="Titulo">Activos</h1>
      <div className="selectores">
        <select className="select-locations" value={localizacionSeleccionada} onChange={handleSeleccionLoc}>
          <option value="">Selecciona una localización</option>
          {localizaciones.map((localizacion) => (
            <option key={localizacion.id} value={localizacion.id}>
              {localizacion.name}
            </option>
          ))}
        </select>

        <button className="btn-agregar">Agregar atributos</button>
      </div>

      {dispositivos.length > 0 && (
        <div className="Tabla">
          <table className="Tabla-Datos">
            <thead>
              <tr>
                <th>Nombre del Dispositivo</th>
                <th>Organización</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((dispositivo) => (
                <tr key={dispositivo.systemName} onClick={() => handleSeleccionDispositivo(dispositivo)}>
                  <td>{dispositivo.displayName}</td>
                  <td>{dispositivo.organizationId}</td>
                  <td>{dispositivo.publicIP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dispositivoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Información del Dispositivo</h2>
                <ul>
                    {Object.entries(dispositivoSeleccionado).map(([key, value]) => (
                    <li key={key}>
                        <strong>{formatearAtributos(key)}:</strong> {typeof value === "object" ? JSON.stringify(value) : value.toString()}
                    </li>
                    ))}
                </ul>
            <button className="btn-cerrar" onClick={cerrarModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contenido;