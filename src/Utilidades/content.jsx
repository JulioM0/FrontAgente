import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
  const [localizaciones, setLocalizaciones] = useState([]);
  const [localizacionSeleccionada, setLocalizacionSeleccionada] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);
  const [dispositivosPorLocalizacion, setDispositivosPorLocalizacion] = useState({});

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

useEffect(() => {
  const contarDispositivos = async () => {
    try{
      const promesas = localizaciones.map((localizacion) =>
        api.get(`devices?id=${localizacion.id}`).then((response) => ({
          id: localizacion.id,
          total: response.data.length,
        }))
    );
    const resultado = await Promise.all(promesas);
    const conteo = resultado.reduce((acc, {id, total }) => {
      acc[id] = total;
      return acc;
    }, {})

    setDispositivosPorLocalizacion(conteo);
    }
    catch (error){
      console.error("Error al obtener los dispositivos", error);
    }
  }
  if(localizaciones.length > 0) contarDispositivos();
}, [localizaciones])

  const handleSeleccionLoc = (id) => {
    setLocalizacionSeleccionada(id);
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
      <div className="Titulo">
        <h1>Activos</h1>
      </div>
        <div className="Localizaciones">
          <h1>Localizaciones</h1>
          <div className="lista-localizaciones">
            {localizaciones.map((localizacion) => (
              <div
                key={localizacion.id}
                className={`localizacion-item ${localizacionSeleccionada === localizacion.id ? "seleccionado" : ""}`}
                onClick={() => handleSeleccionLoc(localizacion.id)}
              >
                <span className="nombre">{localizacion.name}</span>
                <span className="cantidad">
                  {dispositivosPorLocalizacion[localizacion.id] || 0} dispositivos
                </span>
              </div>
            ))}
          </div>
        </div>

      {dispositivos.length > 0 && (
        <div className="dispositivos">
          <h1 className="titulo-dispositivos">Dispositivos</h1>
          <div className="lista-dispositivos">
            {dispositivos.map((dispositivo) => (
            <div
            key={dispositivo.systemName}
            className={`dispositivo-item ${
              dispositivoSeleccionado === dispositivo.systemName ? "seleccionado" : ""
            }`}
            onClick={() => handleSeleccionDispositivo(dispositivo)}
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
          ))}
          </div>
        </div>
      )}
  </div>
  );
};
export default Contenido;