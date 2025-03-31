import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
  const [localizaciones, setLocalizaciones] = useState([]);
  const [localizacionSeleccionada, setLocalizacionSeleccionada] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);
  const [dispositivosPorLocalizacion, setDispositivosPorLocalizacion] = useState({});
  const [esquemas, setEsquemas] = useState([]);
  const [esquemaSeleccionado, setEsquemaSeleccionado] = useState("");
  const [objetos, setObjetos] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(null); 

useEffect(() => {
  const obtenerEsquemas = async () => {
    try{
      const response = await api.get("esquemas");
      setEsquemas(response.data);
    }
    catch (error){
      console.error("Error al obtener los esquemas", error)
    }
  };
  obtenerEsquemas();
}, []);

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

  const handleEsquemaChange = async (e) => {
    const id = e.target.value;
    setEsquemaSeleccionado(id);
  
    if (id) {
      try {
        const respuesta = await api.get(`tipoObjeto?esquemaID=${id}`);
        console.log("Objetos recibidos:", respuesta.data);
        setObjetos(respuesta.data);
      } catch (error) {
        console.error("Error al cargar los objetos:", error);
      }
    } else {
      setObjetos([]);
    }
  };

  const handleSeleccionDispositivo = (dispositivo) => {
    setDispositivoSeleccionado(dispositivo);
  };

  const handleSeleccionarItem = (item) => {
    setItemSeleccionado(item);
  }
  const handleQuitarSeleccionItem = () => {
    setItemSeleccionado(null)
    setEsquemaSeleccionado(null)
  }

  const cerrarModal = () => {
    setDispositivoSeleccionado(null)
    setItemSeleccionado(null)
    setEsquemaSeleccionado(null)
  };

  return (
    <div className="Contenido">
        <h1 className="Titulo">Activos</h1>
      <div className="Contenido-general">
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
              {itemSeleccionado && (
                <div className="Add-atributo">
                <strong>Agregar atributos a:</strong>
                <select onChange={handleEsquemaChange} value={esquemaSeleccionado} className="Esquemas">
                  <option value="">Selecciona un Esquema</option>
                  {esquemas.map((esquema) => (
                    <option key={esquema.esquemaID} value={esquema.esquemaID}>
                      {esquema.esquema}
                    </option>
                  ))}
                </select>
                <select disabled={objetos.length === 0} className="Objetos">
                  <option value="">-- Seleccionar --</option>
                  {objetos.length > 0 &&
                    objetos.map((objeto) => (
                      <option key={objeto.tipoObjetoID} value={objeto.tipoObjetoID}>
                        {objeto.tipoObjeto}
                      </option>
                    ))}
                </select>
                <button className="btnAgregar">Agregar</button>
                <button className="btnQuitarSeleccion" onClick={handleQuitarSeleccionItem}>Quitar Seleccion</button>
                <p className="nota"><strong>Seleccionaste: "{itemSeleccionado}"</strong></p>
              </div>
              )}
              <h4>General</h4>
                <div className="info-grid">
                  <div className="info-item" id="id" onClick={() => handleSeleccionarItem("id")}><span className="label">ID:</span><span className="value">{dispositivoSeleccionado.id}</span></div>
                  <div className="info-item" id="organizationId" onClick={() => handleSeleccionarItem("organizationId")}><span className="label">Organization ID:</span><span className="value">{dispositivoSeleccionado.organizationId}</span></div>
                  <div className="info-item" id="locationId" onClick={() => handleSeleccionarItem("locationId")}><span className="label">Location ID:</span><span className="value">{dispositivoSeleccionado.locationId}</span></div>
                  <div className="info-item" id="nodeClass" onClick={() => handleSeleccionarItem("nodeClass")}><span className="label">Node Class:</span><span className="value">{dispositivoSeleccionado.nodeClass}</span></div>
                  <div className="info-item" id="approvalStatus" onClick={() => handleSeleccionarItem("approvalStatus")}><span className="label">Approval Status:</span><span className="value">{dispositivoSeleccionado.approvalStatus}</span></div>
                  <div className="info-item" id="offline" onClick={() => handleSeleccionarItem("offline")}><span className="label">Offline:</span><span className="value">{dispositivoSeleccionado.offline ? "Si" : "No"}</span></div>
                  <div className="info-item" id="displayName" onClick={() => handleSeleccionarItem("displayName")}><span className="label">Display Name:</span><span className="value">{dispositivoSeleccionado.displayName}</span></div>
                  <div className="info-item" id="systemName" onClick={() => handleSeleccionarItem("systemName")}><span className="label">System Name:</span><span className="value">{dispositivoSeleccionado.systemName}</span></div>
                  <div className="info-item" id="dnsName" onClick={() => handleSeleccionarItem("dnsName")}><span className="label">DNS Name:</span><span className="value">{dispositivoSeleccionado.dnsName}</span></div>
                  <div className="info-item" id="ipAddresses" onClick={() => handleSeleccionarItem("ipAddresses")}><span className="label">IP Addresses:</span><span className="value">{dispositivoSeleccionado.ipAddresses.join(", ")}</span></div>
                  <div className="info-item" id="macAddresses" onClick={() => handleSeleccionarItem("macAddresses")}><span className="label">MAC Addresses:</span><span className="value">{dispositivoSeleccionado.macAddresses.join(", ")}</span></div>
                  <div className="info-item" id="publicIP" onClick={() => handleSeleccionarItem("publicIP")}><span className="label">Public IP:</span><span className="value">{dispositivoSeleccionado.publicIP}</span></div>
                  <div className="info-item" id="created" onClick={() => handleSeleccionarItem("created")}><span className="label">Created:</span><span className="value">{new Date(dispositivoSeleccionado.created * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastContact" onClick={() => handleSeleccionarItem("lastContact")}><span className="label">Last Contact:</span><span className="value">{new Date(dispositivoSeleccionado.lastContact * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastUpdate" onClick={() => handleSeleccionarItem("lastUpdate")}><span className="label">Last Update:</span><span className="value">{new Date(dispositivoSeleccionado.lastUpdate * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastLoggedInUser" onClick={() => handleSeleccionarItem("lastLoggedInUser")}><span className="label">Last logged in user:</span><span className="value">{dispositivoSeleccionado.lastLoggedInUser}</span></div>
                  <div className="info-item" id="deviceType" onClick={() => handleSeleccionarItem("deviceType")}><span className="label">Device type:</span><span className="value">{dispositivoSeleccionado.deviceType}</span></div>
                </div>
                <h4>Información del Sistema Operativo</h4>
                <div className="info-grid">
                  <div className="info-item" id="os.manufactures" onClick={() => handleSeleccionarItem("os.manufactures")}><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.os.manufacturer}</span></div>
                  <div className="info-item" id="os.name" onClick={() => handleSeleccionarItem("os.name")}><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.os.name}</span></div>
                  <div className="info-item" id="os.architecture" onClick={() => handleSeleccionarItem("os.architecture")}><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.os.architecture}</span></div>
                  <div className="info-item" id="os.lastBootTime" onClick={() => handleSeleccionarItem("os.lastBootTime")}><span className="label">Last Boot Time:</span><span className="value">{new Date(dispositivoSeleccionado.os.lastBootTime * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="os.buildNumber" onClick={() => handleSeleccionarItem("os.buildNumber")}><span className="label">Build Number:</span><span className="value">{dispositivoSeleccionado.os.buildNumber}</span></div>
                  <div className="info-item" id="os.releaseId" onClick={() => handleSeleccionarItem("os.releaseId")}><span className="label">Release ID:</span><span className="value">{dispositivoSeleccionado.os.releaseId}</span></div>
                  <div className="info-item" id="os.locale" onClick={() => handleSeleccionarItem("os.locale")}><span className="label">Locale:</span><span className="value">{dispositivoSeleccionado.os.locale}</span></div>
                  <div className="info-item" id="os.language" onClick={() => handleSeleccionarItem("os.language")}><span className="label">Language:</span><span className="value">{dispositivoSeleccionado.os.language}</span></div>
                  <div className="info-item" id="os.needsReboot" onClick={() => handleSeleccionarItem("os.needsReboot")}><span className="label">NeedsReboot:</span><span className="value">{dispositivoSeleccionado.os.needsReboot ? "Si" : "No"}</span></div>
                </div>
                <h4>Información del Sistema</h4>
                <div className="info-grid">
                  <div className="info-item" id="system.name" onClick={() => handleSeleccionarItem("system.name")}><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.system.name}</span></div>
                  <div className="info-item" id="system.manufacturer" onClick={() => handleSeleccionarItem("system.manufacturer")}><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.system.manufacturer}</span></div>
                  <div className="info-item" id="system.model" onClick={() => handleSeleccionarItem("system.model")}><span className="label">Model:</span><span className="value">{dispositivoSeleccionado.system.model}</span></div>
                  <div className="info-item" id="system.biosSerialNumber" onClick={() => handleSeleccionarItem("system.biosSerialNumber")}><span className="label">Bios Serial Number:</span><span className="value">{dispositivoSeleccionado.system.biosSerialNumber}</span></div>
                  <div className="info-item" id="system.serialNumber" onClick={() => handleSeleccionarItem("system.serialNumber")}><span className="label">Serial Number:</span><span className="value">{dispositivoSeleccionado.system.serialNumber}</span></div>
                  <div className="info-item" id="system.domain" onClick={() => handleSeleccionarItem("system.domain")}><span className="label">Domain:</span><span className="value">{dispositivoSeleccionado.system.domain}</span></div>
                  <div className="info-item" id="system.domainRole" onClick={() => handleSeleccionarItem("system.domainRole")}><span className="label">Domain Role:</span><span className="value">{dispositivoSeleccionado.system.domainRole}</span></div>
                  <div className="info-item" id="system.numberOfProcessors" onClick={() => handleSeleccionarItem("system.numberOfProcessors")}><span className="label">Number of Processors:</span><span className="value">{dispositivoSeleccionado.system.numberOfProcessors}</span></div>
                  <div className="info-item" id="system.totalPhysicalMemory" onClick={() => handleSeleccionarItem("system.totalPhysicalMemory")}><span className="label">Total Memory:</span><span className="value">{(dispositivoSeleccionado.system.totalPhysicalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="system.virtualMachine" onClick={() => handleSeleccionarItem("system.virtualMachine")}><span className="label">Virtual Machine:</span><span className="value">{dispositivoSeleccionado.system.virtualMachine  ? "Si" : "No"}</span></div>
                  <div className="info-item" id="system.chassisType" onClick={() => handleSeleccionarItem("system.chassisTypeviceType")}><span className="label">Chassis Type:</span><span className="value">{dispositivoSeleccionado.system.chassisType}</span></div>
                </div>
                <h4>Información del Procesador</h4>
                <div className="info-grid">
                <div className="info-item" id="processors.architecture" onClick={() => handleSeleccionarItem("processors.architecture")}><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.processors[0]?.architecture}</span></div>
                <div className="info-item" id="processors.MaxClockSpeed" onClick={() => handleSeleccionarItem("processors.MaxClockSpeed")}><span className="label">MaxClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors[0]?.maxClockSpeed}</span></div>
                <div className="info-item" id="processors.ClockSpeed" onClick={() => handleSeleccionarItem("processors.ClockSpeed")}><span className="label">ClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors[0]?.clockSpeed}</span></div>
                <div className="info-item" id="processors.Name" onClick={() => handleSeleccionarItem("processors.Name")}><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.processors[0]?.name}</span></div>
                <div className="info-item" id="processors.NumCores" onClick={() => handleSeleccionarItem("processors.NumCores")}><span className="label">NumCores:</span><span className="value">{dispositivoSeleccionado.processors[0]?.numCores}</span></div>
                <div className="info-item" id="processors.NumLogicalCores" onClick={() => handleSeleccionarItem("processors.NumLogicalCores")}><span className="label">NumLogicalCores:</span><span className="value">{dispositivoSeleccionado.processors[0]?.numLogicalCores}</span></div>
                </div>
                <h4>Informacion del Disco</h4>
                <div className="info-grid">
                  <div className="info-item" id="volumes.nodeId" onClick={() => handleSeleccionarItem("volumes.nodeId")}><span className="label">Node ID:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.nodeId}</span></div>
                  <div className="info-item" id="volumes.Name" onClick={() => handleSeleccionarItem("volumes.Name")}><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.name}</span></div>
                  <div className="info-item" id="volumes.Label" onClick={() => handleSeleccionarItem("volumes.Label")}><span className="label">Label:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.label}</span></div>
                  <div className="info-item" id="volumes.DeviceType" onClick={() => handleSeleccionarItem("volumes.DeviceType")}><span className="label">DeviceType:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.deviceType}</span></div>
                  <div className="info-item" id="volumes.FileSystem" onClick={() => handleSeleccionarItem("volumes.FileSystem")}><span className="label">File System:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.fileSystem}</span></div>
                  <div className="info-item" id="volumes.AutoMount" onClick={() => handleSeleccionarItem("volumes.AutoMount")}><span className="label">AutoMount:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.autoMount ? "Si" : "No"}</span></div>
                  <div className="info-item" id="volumes.Compressed" onClick={() => handleSeleccionarItem("volumes.Compressed")}><span className="label">Compressed:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.compressed ? "Si" : "No"}</span></div>
                  <div className="info-item" id="volumes.Capacity" onClick={() => handleSeleccionarItem("volumes.Capacity")}><span className="label">Capacity:</span><span className="value">{(dispositivoSeleccionado.volumes[0]?.capacity / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="volumes.Freespace" onClick={() => handleSeleccionarItem("volumes.Freespace")}><span className="label">FreeSpace:</span><span className="value">{(dispositivoSeleccionado.volumes[0]?.freeSpace / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="volumes.SerialNumber" onClick={() => handleSeleccionarItem("volumes.SerialNumber")}><span className="label">SerialNumber:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.serialNumber}</span></div>
                </div>
                <button className="btn-cerrar" onClick={cerrarModal}>
                  Cerrar
                </button>
            </div>
          </div>
        )}
      </div>  
  </div>
  );
};
export default Contenido;