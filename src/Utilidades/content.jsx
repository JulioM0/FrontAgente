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
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
  const [atributos, setAtributos] = useState([]);

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

  const handleObjetoChange = async (e) => {
    const id = e.target.value;
    setObjetoSeleccionado(id)

    if (id) {
      try {
        const respuesta = await api.get(`tipoObjetoAtributo?tipoObjetoID=${id}`);
        console.log("Objetos recibidos:", respuesta.data);
        setAtributos(respuesta.data);
      } catch (error) {
        console.error("Error al cargar los atributos:", error);
      }
    } else {
      setAtributos([]);
    }
  };

  const handleSeleccionDispositivo = (dispositivo) => {
    setDispositivoSeleccionado(dispositivo);
  };

  const handleQuitarSeleccionItem = () => {
    setAtributos([]);
    setObjetoSeleccionado(""); 
    setEsquemaSeleccionado(""); 
  }

  const cerrarModal = () => {
    setDispositivoSeleccionado(null)
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
              <h4>Agregar atributos</h4>
                <div className="Add-atributo">
                <select onChange={handleEsquemaChange} value={esquemaSeleccionado} className="Esquemas">
                  <option value="">Selecciona un Esquema</option>
                  {esquemas.map((esquema) => (
                    <option key={esquema.esquemaID} value={esquema.esquemaID}>
                      {esquema.esquema}
                    </option>
                  ))}
                </select>
                <select disabled={objetos.length === 0} onChange={handleObjetoChange} value={objetoSeleccionado} className="Objetos">
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
                  <div className="info-grid2">
                      {atributos.map((atributo) => (
                        <div className="info-item" key={atributo.tipoObjetoAtributoID} value={atributo.tipoObjetoAtributoID}>
                          <strong>{atributo.tipoObjetoAtributoID}, {atributo.tipoObjetoAtributo}</strong>
                          <select className="Info-dispositivos" id="">
                            <option value="">-- Seleccionar --</option>
                            <option value="">{dispositivoSeleccionado.id}</option>
                            <option value="">{dispositivoSeleccionado.organizationId}</option>
                            <option value="">{dispositivoSeleccionado.locationId}</option>
                            <option value="">{dispositivoSeleccionado.nodeClass}</option>
                            <option value="">{dispositivoSeleccionado.approvalStatus}</option>
                            <option value="">{dispositivoSeleccionado.offline ? "Si" : "No"}</option>
                            <option value="">{dispositivoSeleccionado.displayName}</option>
                          </select>
                        </div>
                      ))}
                  </div>
              </div>
              <h4>General</h4>
                <div className="info-grid">
                  <div className="info-item" id="id" ><span className="label">ID:</span><span className="value">{dispositivoSeleccionado.id}</span></div>
                  <div className="info-item" id="organizationId" ><span className="label">Organization ID:</span><span className="value">{dispositivoSeleccionado.organizationId}</span></div>
                  <div className="info-item" id="locationId" ><span className="label">Location ID:</span><span className="value">{dispositivoSeleccionado.locationId}</span></div>
                  <div className="info-item" id="nodeClass" ><span className="label">Node Class:</span><span className="value">{dispositivoSeleccionado.nodeClass}</span></div>
                  <div className="info-item" id="approvalStatus" ><span className="label">Approval Status:</span><span className="value">{dispositivoSeleccionado.approvalStatus}</span></div>
                  <div className="info-item" id="offline" ><span className="label">Offline:</span><span className="value">{dispositivoSeleccionado.offline ? "Si" : "No"}</span></div>
                  <div className="info-item" id="displayName" ><span className="label">Display Name:</span><span className="value">{dispositivoSeleccionado.displayName}</span></div>
                  <div className="info-item" id="systemName" ><span className="label">System Name:</span><span className="value">{dispositivoSeleccionado.systemName}</span></div>
                  <div className="info-item" id="dnsName" ><span className="label">DNS Name:</span><span className="value">{dispositivoSeleccionado.dnsName}</span></div>
                  <div className="info-item" id="ipAddresses"><span className="label">IP Addresses:</span><span className="value">{dispositivoSeleccionado.ipAddresses.join(", ")}</span></div>
                  <div className="info-item" id="macAddresses" ><span className="label">MAC Addresses:</span><span className="value">{dispositivoSeleccionado.macAddresses.join(", ")}</span></div>
                  <div className="info-item" id="publicIP" ><span className="label">Public IP:</span><span className="value">{dispositivoSeleccionado.publicIP}</span></div>
                  <div className="info-item" id="created" ><span className="label">Created:</span><span className="value">{new Date(dispositivoSeleccionado.created * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastContact" ><span className="label">Last Contact:</span><span className="value">{new Date(dispositivoSeleccionado.lastContact * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastUpdate"><span className="label">Last Update:</span><span className="value">{new Date(dispositivoSeleccionado.lastUpdate * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="lastLoggedInUser" ><span className="label">Last logged in user:</span><span className="value">{dispositivoSeleccionado.lastLoggedInUser}</span></div>
                  <div className="info-item" id="deviceType" ><span className="label">Device type:</span><span className="value">{dispositivoSeleccionado.deviceType}</span></div>
                </div>
                <h4>Información del Sistema Operativo</h4>
                <div className="info-grid">
                  <div className="info-item" id="os.manufactures" ><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.os.manufacturer}</span></div>
                  <div className="info-item" id="os.name" ><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.os.name}</span></div>
                  <div className="info-item" id="os.architecture" ><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.os.architecture}</span></div>
                  <div className="info-item" id="os.lastBootTime" ><span className="label">Last Boot Time:</span><span className="value">{new Date(dispositivoSeleccionado.os.lastBootTime * 1000).toLocaleString()}</span></div>
                  <div className="info-item" id="os.buildNumber" ><span className="label">Build Number:</span><span className="value">{dispositivoSeleccionado.os.buildNumber}</span></div>
                  <div className="info-item" id="os.releaseId" ><span className="label">Release ID:</span><span className="value">{dispositivoSeleccionado.os.releaseId}</span></div>
                  <div className="info-item" id="os.locale" ><span className="label">Locale:</span><span className="value">{dispositivoSeleccionado.os.locale}</span></div>
                  <div className="info-item" id="os.language" ><span className="label">Language:</span><span className="value">{dispositivoSeleccionado.os.language}</span></div>
                  <div className="info-item" id="os.needsReboot"><span className="label">NeedsReboot:</span><span className="value">{dispositivoSeleccionado.os.needsReboot ? "Si" : "No"}</span></div>
                </div>
                <h4>Información del Sistema</h4>
                <div className="info-grid">
                  <div className="info-item" id="system.name" ><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.system.name}</span></div>
                  <div className="info-item" id="system.manufacturer" ><span className="label">Manufacturer:</span><span className="value">{dispositivoSeleccionado.system.manufacturer}</span></div>
                  <div className="info-item" id="system.model" ><span className="label">Model:</span><span className="value">{dispositivoSeleccionado.system.model}</span></div>
                  <div className="info-item" id="system.biosSerialNumber" ><span className="label">Bios Serial Number:</span><span className="value">{dispositivoSeleccionado.system.biosSerialNumber}</span></div>
                  <div className="info-item" id="system.serialNumber" ><span className="label">Serial Number:</span><span className="value">{dispositivoSeleccionado.system.serialNumber}</span></div>
                  <div className="info-item" id="system.domain" ><span className="label">Domain:</span><span className="value">{dispositivoSeleccionado.system.domain}</span></div>
                  <div className="info-item" id="system.domainRole"><span className="label">Domain Role:</span><span className="value">{dispositivoSeleccionado.system.domainRole}</span></div>
                  <div className="info-item" id="system.numberOfProcessors" ><span className="label">Number of Processors:</span><span className="value">{dispositivoSeleccionado.system.numberOfProcessors}</span></div>
                  <div className="info-item" id="system.totalPhysicalMemory" ><span className="label">Total Memory:</span><span className="value">{(dispositivoSeleccionado.system.totalPhysicalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="system.virtualMachine" ><span className="label">Virtual Machine:</span><span className="value">{dispositivoSeleccionado.system.virtualMachine  ? "Si" : "No"}</span></div>
                  <div className="info-item" id="system.chassisType" ><span className="label">Chassis Type:</span><span className="value">{dispositivoSeleccionado.system.chassisType}</span></div>
                </div>
                <h4>Información del Procesador</h4>
                <div className="info-grid">
                <div className="info-item" id="processors.architecture" ><span className="label">Architecture:</span><span className="value">{dispositivoSeleccionado.processors[0]?.architecture}</span></div>
                <div className="info-item" id="processors.MaxClockSpeed"><span className="label">MaxClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors[0]?.maxClockSpeed}</span></div>
                <div className="info-item" id="processors.ClockSpeed" ><span className="label">ClockSpeed:</span><span className="value">{dispositivoSeleccionado.processors[0]?.clockSpeed}</span></div>
                <div className="info-item" id="processors.Name"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.processors[0]?.name}</span></div>
                <div className="info-item" id="processors.NumCores" ><span className="label">NumCores:</span><span className="value">{dispositivoSeleccionado.processors[0]?.numCores}</span></div>
                <div className="info-item" id="processors.NumLogicalCores" ><span className="label">NumLogicalCores:</span><span className="value">{dispositivoSeleccionado.processors[0]?.numLogicalCores}</span></div>
                </div>
                <h4>Informacion del Disco</h4>
                <div className="info-grid">
                  <div className="info-item" id="volumes.nodeId"><span className="label">Node ID:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.nodeId}</span></div>
                  <div className="info-item" id="volumes.Name"><span className="label">Name:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.name}</span></div>
                  <div className="info-item" id="volumes.Label" ><span className="label">Label:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.label}</span></div>
                  <div className="info-item" id="volumes.DeviceType" ><span className="label">DeviceType:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.deviceType}</span></div>
                  <div className="info-item" id="volumes.FileSystem" ><span className="label">File System:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.fileSystem}</span></div>
                  <div className="info-item" id="volumes.AutoMount" ><span className="label">AutoMount:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.autoMount ? "Si" : "No"}</span></div>
                  <div className="info-item" id="volumes.Compressed" ><span className="label">Compressed:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.compressed ? "Si" : "No"}</span></div>
                  <div className="info-item" id="volumes.Capacity"><span className="label">Capacity:</span><span className="value">{(dispositivoSeleccionado.volumes[0]?.capacity / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="volumes.Freespace" ><span className="label">FreeSpace:</span><span className="value">{(dispositivoSeleccionado.volumes[0]?.freeSpace / (1024 * 1024 * 1024)).toFixed(2)} GB</span></div>
                  <div className="info-item" id="volumes.SerialNumber" ><span className="label">SerialNumber:</span><span className="value">{dispositivoSeleccionado.volumes[0]?.serialNumber}</span></div>
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