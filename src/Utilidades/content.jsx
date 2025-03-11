import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
   const [dispositivos, setDispositivos] = useState([]);
   const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("");

   useEffect(() => {
    const fetchDispositivos = async () => {
      try {
        const response = await api.get("devices");
        setDispositivos(response.data);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
      }
    };
    fetchDispositivos();
}, []);

const handleSeleccion = (event) => {
    setDispositivoSeleccionado(event.target.value)
    console.log("Dispositivo seleccionado", event.target.value);
};

return (
  <div className="content">
    <h1>Dispositivos</h1>
    <div className="data">
        <select value={dispositivoSeleccionado} onChange={handleSeleccion}>
            <option value="">Selecciona un dispositivo</option>
            {dispositivos.map((dispositivo, index) => (
                <option key={index}>{dispositivo.systemName}</option>
            ))}
        </select>
        {dispositivoSeleccionado && dispositivos (
            <p>Dispostivo seleccionado: <strong>{dispositivoSeleccionado}</strong></p>
        )}
    </div>
    
  </div>
);
};
export default Contenido;