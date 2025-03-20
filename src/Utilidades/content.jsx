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
                  <td>{dispositivo.organizationName}</td>
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
                  <h3>Informacion General</h3>
                    <li><strong>ID:</strong>{dispositivoSeleccionado.id}</li>
                    <li><strong>OrganizationID:</strong>{dispositivoSeleccionado.organizationId}</li>
                    <li><strong>LocationID:</strong>{dispositivoSeleccionado.locationId}</li>
                    <li><strong>NodeClass:</strong>{dispositivoSeleccionado.nodeClass}</li>
                    <li><strong>NodeRoleID:</strong>{dispositivoSeleccionado.nodeRoleId}</li>
                    <li><strong>RolePolicyID:</strong>{dispositivoSeleccionado.rolePolicyId}</li>
                    <li><strong>ApprovalStatus:</strong>{dispositivoSeleccionado.approvalStatus}</li>
                    <li><strong>Offline:</strong>{dispositivoSeleccionado.offline ? "Si": "No"}</li>
                    <li><strong>DisplayName:</strong>{dispositivoSeleccionado.displayName}</li>
                    <li><strong>SystemName:</strong>{dispositivoSeleccionado.systemName}</li>
                    <li><strong>DNSName:</strong>{dispositivoSeleccionado.dnsName}</li>
                    <li><strong>Created:</strong>{new Date(dispositivoSeleccionado.created * 1000).toLocaleString()}</li>
                    <li><strong>LastContact:</strong>{new Date(dispositivoSeleccionado.lastContact * 1000).toLocaleString()}</li>
                    <li><strong>LastUpdate:</strong>{new Date(dispositivoSeleccionado.lastUpdate * 1000).toLocaleString()}</li>
                    <li><strong>IPAddresses:</strong>{dispositivoSeleccionado.ipAddresses}</li>
                    <li><strong>MacAddresses:</strong>{dispositivoSeleccionado.ipAddresses}</li>
                    <li><strong>PublicIP:</strong>{dispositivoSeleccionado.publicIP}</li>
                  <h3>Informacion del Sistema Operativo</h3>
                    <li><strong>Manufacturer:</strong>{dispositivoSeleccionado.os.manufacturer}</li>
                    <li><strong>Name:</strong>{dispositivoSeleccionado.os.name}</li>
                    <li><strong>Architecture:</strong>{dispositivoSeleccionado.os.architecture}</li>
                    <li><strong>LastBootTime:</strong>{new Date(dispositivoSeleccionado.os.lastBootTime * 1000).toLocaleString()}</li>
                    <li><strong>BuildNumber:</strong>{dispositivoSeleccionado.os.buildNumber}</li>
                    <li><strong>ReleaseID:</strong>{dispositivoSeleccionado.os.releaseId}</li>
                    <li><strong>ServicePackMajorVersion:</strong>{dispositivoSeleccionado.os.servicePackMajorVersion}</li>
                    <li><strong>ServicePackMinorVersion:</strong>{dispositivoSeleccionado.os.servicePackMinorVersion}</li>
                    <li><strong>Locale:</strong>{dispositivoSeleccionado.os.locale}</li>
                    <li><strong>Language:</strong>{dispositivoSeleccionado.os.language}</li>
                    <li><strong>NeedsReboot:</strong>{dispositivoSeleccionado.os.needsReboot ? "Si": "No"}</li>
                  <h3>Informacion del Sistema</h3>
                    <li><strong>Name:</strong>{dispositivoSeleccionado.system.name}</li>
                    <li><strong>Manufacturer:</strong>{dispositivoSeleccionado.system.manufacturer}</li>
                    <li><strong>Model:</strong>{dispositivoSeleccionado.system.model}</li>
                    <li><strong>BiosSerialNumber:</strong>{dispositivoSeleccionado.system.biosSerialNumber}</li>
                    <li><strong>SerialNumber:</strong>{dispositivoSeleccionado.system.serialNumber}</li>
                    <li><strong>Domain:</strong>{dispositivoSeleccionado.system.domain}</li>
                    <li><strong>DomainRole:</strong>{dispositivoSeleccionado.system.domainRole}</li>
                    <li><strong>NumberOfProcessors:</strong>{dispositivoSeleccionado.system.numberOfProcessors}</li>
                    <li><strong>TotalPhysicalMemory:</strong>{(dispositivoSeleccionado.system.totalPhysicalMemory / (1024 * 1024 * 1024)).toFixed(2) + "GB"}</li>
                    <li><strong>VirtualMachine:</strong>{dispositivoSeleccionado.system.virtualMachine ? "Si":"No"}</li>
                    <li><strong>ChassisType:</strong>{dispositivoSeleccionado.system.chassisType}</li>

        
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