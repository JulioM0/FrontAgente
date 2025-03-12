import React, { useEffect, useState } from "react";
import api from "../api.js";
import "../Estilos/content.css";

const Contenido = () => {
   const [localizaciones, setLocalizacion] = useState([]);
   const [localizacionSeleccionada, setLocalizacionSeleccionada] = useState("");
   const [dispositivos, setDispositivos] = useState([]);
   const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("");
   const [infoDispositivo, setInfoDispositivo] = useState(null);

   useEffect(() => {
    const Localizaciones = async () => {
        try{
            const response = await api.get("locations")
            setLocalizacion(response.data)
        }
        catch (error){
            console.error("Error al obtener las localizaciones:", error)
        }
    }
    Localizaciones();
  },[])

   useEffect(() => {
    const Dispositivos = async () => {
      if(!localizacionSeleccionada) return;
          const [id, organizationId] = localizacionSeleccionada.split(",");
        try {
            const response = await api.get(`devices?id=${id}&organizationId=${organizationId}`);
            setDispositivos(response.data);
        } catch (error) {
            console.error("Error al obtener dispositivos:", error);
        }
    };
    Dispositivos();
}, [localizacionSeleccionada]);

const handleSeleccionLoc = (event) => {
  setLocalizacionSeleccionada(event.target.value)
  setDispositivoSeleccionado("")
  setInfoDispositivo(null);
};
const handleSeleccion = (event) => {
    const selectedDevice = dispositivos.find(dispositivo => dispositivo.systemName === event.target.value);
    setDispositivoSeleccionado(event.target.value)
    setInfoDispositivo(selectedDevice)
};

return (
  <div className="Contenido">
    <h1 className="Titulo">Activos</h1>
    <div className="selectores">
      
        <select className="select-locations" value={localizacionSeleccionada} onChange={handleSeleccionLoc}>
            <option value="">Selecciona una localizacion</option>
            {localizaciones.map(localizacion => (
              <option key={localizacion.id} value={`${localizacion.id},${localizacion.organizationId}`}>{localizacion.name}, {localizacion.organizationId}</option>
            ))}
        </select>

        <select value={dispositivoSeleccionado} onChange={handleSeleccion} disabled={!dispositivos.length}>
                    <option value="">Selecciona un dispositivo</option>
                    {dispositivos.map((dispositivo, index) => (
                        <option key={index} value={dispositivo.systemName}>
                            {dispositivo.systemName}
                        </option>
                    ))}
        </select>
        
    </div>
    <div className="Tabla" style={{overflowX: 'auto'}}>
    {infoDispositivo && (
        <table className="Tabla-Datos">
            <thead>
                <tr>
                    <th>Nombre</th>
                        <th>Organization</th>
                        <th>Location</th>
                        <th>NodeClass</th>
                        <th>NodeRoleID</th>
                        <th>RolePolicyID</th>
                        <th>ApprovalStatus</th>
                        <th>Offline</th>
                        <th>SystemName</th>
                        <th>dnsName</th>
                        <th>Created</th>
                        <th>LastContact</th>
                        <th>LastUpdate</th>
                        <th>IPAddresses</th>
                        <th>MACAddresses</th>
                        <th>Manufacturer</th>
                        <th>OSName</th>
                        <th>Architecture</th>
                        <th>LastBootTime</th>
                        <th>BuildNumber</th>
                        <th>ReleaseId</th>
                        <th>Locale</th>
                        <th>Language</th>
                        <th>NeedsReboot</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{infoDispositivo.displayName}</td>
                    <td>{infoDispositivo.organizationId}</td>
                    <td>{infoDispositivo.locationId}</td>
                    <td>{infoDispositivo.nodeClass}</td>
                    <td>{infoDispositivo.nodeRoleId}</td>
                    <td>{infoDispositivo.rolePolicyId}</td>
                    <td>{infoDispositivo.approvalStatus}</td>
                    <td>{infoDispositivo.offline ? "Sí" : "No"}</td>
                    <td>{infoDispositivo.systemName}</td>
                    <td>{infoDispositivo.dnsName}</td>
                    <td>{infoDispositivo.created}</td>
                    <td>{infoDispositivo.lastContact}</td>
                    <td>{infoDispositivo.lastUpdate}</td>
                    <td> 
                        <ul style={{ listStyleType: "none"}}>
                        {infoDispositivo.ipAddresses.map((ip, index) => (
                        <li key={index}>{ip}</li>
                        ))}
                        </ul>
                    </td>
                    <td>
                    <ul style={{ listStyleType: "none"}}>
                        {infoDispositivo.macAddresses.map((mac, index) => (
                        <li key={index}>{mac}</li>
                        ))}
                        </ul>
                    </td>
                    <td>{infoDispositivo.os.manufacturer}</td>
                    <td>{infoDispositivo.os.name}</td>
                    <td>{infoDispositivo.os.architecture}</td>
                    <td>{infoDispositivo.os.lastBootTime}</td>
                    <td>{infoDispositivo.os.buildNumber}</td>
                    <td>{infoDispositivo.os.releaseId}</td>
                    <td>{infoDispositivo.os.locale}</td>
                    <td>{infoDispositivo.os.language}</td>
                    <td>{infoDispositivo.os.needsReboot ? "Si" : "No"}</td>
                </tr>
            </tbody>
        </table>
    )}                  
    </div>
</div>
    );
};
export default Contenido;