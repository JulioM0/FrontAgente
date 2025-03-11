import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
   const [dispositivos, setDispositivos] = useState([]);

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

return (
  <div className="content">
    <h1>Dispositivos</h1>
    <ul>
      {dispositivos.map((dispositivo, index) => (
        <li key={index}>{dispositivo.nombre}</li>
      ))}
    </ul>
  </div>
);
};
export default Contenido;