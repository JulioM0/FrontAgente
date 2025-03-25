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

      {dispositivoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Dispositivo: {dispositivoSeleccionado.systemName}.</h2> 
            <h3 className={`estado-dispositivo ${dispositivoSeleccionado.offline ? "desconectado" : "conectado"}`}>{dispositivoSeleccionado.offline ? "Desconectado" : "Conectado"}</h3>
            <h4>General</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">ID:</span><span className="value">{dispositivoSeleccionado.id}</span></div>
                <div className="info-item"><span className="label">Organization ID:</span><span className="value">{dispositivoSeleccionado.organizationId}</span></div>
                <div className="info-item"><span className="label">Location ID:</span><span className="value">{dispositivoSeleccionado.locationId}</span></div>
                <div className="info-item"><span className="label">Node Class:</span><span className="value">{dispositivoSeleccionado.nodeClass}</span></div>
                <div className="info-item"><span className="label">Approval Status:</span><span className="value">{dispositivoSeleccionado.approvalStatus}</span></div>
                <div className="info-item"><span className="label">Offline:</span><span className="value">{dispositivoSeleccionado.offline ? "Si" : "No"}</span></div>
                <div className="info-item"><span className="label">Display Name:</span><span className="value">{dispositivoSeleccionado.displayName}</span></div>
                <div className="info-item"><span className="label">System Name:</span><span className="value">{dispositivoSeleccionado.systemName}</span></div>
                <div className="info-item"><span className="label">DNS Name:</span><span className="value">{dispositivoSeleccionado.dnsName}</span></div>
                <div className="info-item"><span className="label">IP Addresses:</span><span className="value">{dispositivoSeleccionado.ipAddresses.join(", ")}</span></div>
                <div className="info-item"><span className="label">MAC Addresses:</span><span className="value">{dispositivoSeleccionado.macAddresses.join(", ")}</span></div>
                <div className="info-item"><span className="label">Public IP:</span><span className="value">{dispositivoSeleccionado.publicIP}</span></div>
                <div className="info-item"><span className="label">Created:</span><span className="value">{new Date(dispositivoSeleccionado.created * 1000).toLocaleString()}</span></div>
                <div className="info-item"><span className="label">Last Contact:</span><span className="value">{new Date(dispositivoSeleccionado.lastContact * 1000).toLocaleString()}</span></div>
                <div className="info-item"><span className="label">Last Update:</span><span className="value">{new Date(dispositivoSeleccionado.lastUpdate * 1000).toLocaleString()}</span></div>
                <div className="info-item"><span className="label">Last logged in user:</span><span className="value">{dispositivoSeleccionado.lastLoggedInUser}</span></div>
                <div className="info-item"><span className="label">Device type:</span><span className="value">{dispositivoSeleccionado.deviceType}</span></div>
              </div>
              <h4>Información del Sistema Operativo</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.os.manufacturer}</span></div>
                <div className="info-item"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.os.name}</span></div>
                <div className="info-item"><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.os.architecture}</span></div>
                <div className="info-item"><span className="label">Last Boot Time:</span><span className="value">{new Date(dispositivoSeleccionado.os.lastBootTime * 1000).toLocaleString()}</span></div>
                <div className="info-item"><span className="label">Build Number:</span><span className="value">{dispositivoSeleccionado.os.buildNumber}</span></div>
                <div className="info-item"><span className="label">Release ID:</span><span className="value">{dispositivoSeleccionado.os.releaseId}</span></div>
                <div className="info-item"><span className="label">Locale:</span><span className="value">{dispositivoSeleccionado.os.locale}</span></div>
                <div className="info-item"><span className="label">Language:</span><span className="value">{dispositivoSeleccionado.os.language}</span></div>
                <div className="info-item"><span className="label">NeedsReboot:</span><span className="value">{dispositivoSeleccionado.os.needsReboot ? "Si" : "No"}</span></div>
              </div>
              <h4>Información del Sistema</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.system.name}</span></div>
                <div className="info-item"><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.system.manufacturer}</span></div>
                <div className="info-item"><span className="label">Model:</span><span className="value">{dispositivoSeleccionado.system.model}</span></div>
                <div className="info-item"><span className="label">Bios Serial Number:</span><span className="value">{dispositivoSeleccionado.system.biosSerialNumber}</span></div>
                <div className="info-item"><span className="label">Serial Number:</span><span className="value">{dispositivoSeleccionado.system.serialNumber}</span></div>
                <div className="info-item"><span className="label">Domain:</span><span className="value">{dispositivoSeleccionado.system.domain}</span></div>
                <div className="info-item"><span className="label">Domain Role:</span><span className="value">{dispositivoSeleccionado.system.domainRole}</span></div>
                <div className="info-item"><span className="label">Number of Processors:</span><span className="value">{dispositivoSeleccionado.system.numberOfProcessors}</span></div>
                <div className="info-item"><span className="label">Total Memory:</span><span className="value">{(dispositivoSeleccionado.system.totalPhysicalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                <div className="info-item"><span className="label">Virtual Machine:</span><span className="value">{dispositivoSeleccionado.system.virtualMachine  ? "Si" : "No"}</span></div>
                <div className="info-item"><span className="label">Chassis Type:</span><span className="value">{dispositivoSeleccionado.system.chassisType}</span></div>
              </div>
              
              <h4>Información del Procesador</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.processors.architecture}</span></div>
                <div className="info-item"><span className="label">MaxClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors.maxClockSpeed}</span></div>
                <div className="info-item"><span className="label">ClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors.clockSpeed}</span></div>
                <div className="info-item"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.processors.name}</span></div>
                <div className="info-item"><span className="label">NumCores:</span><span className="value">{dispositivoSeleccionado.processors.numCores}</span></div>
                <div className="info-item"><span className="label">NumLogicalCores:</span><span className="value">{dispositivoSeleccionado.processors.numLogicalCores}</span></div>
              </div>
              <h4>Informacion del Disco</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">Node ID:</span><span className="value">{dispositivoSeleccionado.volumes.nodeId}</span></div>
                <div className="info-item"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.volumes.name}</span></div>
                <div className="info-item"><span className="label">Label:</span><span className="value">{dispositivoSeleccionado.volumes.label}</span></div>
                <div className="info-item"><span className="label">DeviceType:</span><span className="value">{dispositivoSeleccionado.volumes.deviceType}</span></div>
                <div className="info-item"><span className="label">File System:</span><span className="value">{dispositivoSeleccionado.volumes.fileSystem}</span></div>
                <div className="info-item"><span className="label">AutoMount:</span><span className="value">{dispositivoSeleccionado.volumes.autoMount}</span></div>
                <div className="info-item"><span className="label">Compressed:</span><span className="value">{dispositivoSeleccionado.volumes.compressed}</span></div>
                <div className="info-item"><span className="label">Capacity:</span><span className="value">{dispositivoSeleccionado.volumes.capacity}</span></div>
                <div className="info-item"><span className="label">FreeSpace:</span><span className="value">{dispositivoSeleccionado.volumes.freeSpace}</span></div>
                <div className="info-item"><span className="label">SerialNumber:</span><span className="value">{dispositivoSeleccionado.volumes.serialNumber}</span></div>
              </div>
              
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