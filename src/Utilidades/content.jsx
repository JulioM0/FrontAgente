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
  const [esquemaSeleccionado, setEsquemaSeleccionado] = useState(null);
  const [objetos, setObjetos] = useState([]);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
  const [atributos, setAtributos] = useState([]);
  const [valoresAtributos, setValoresAtributos] = useState({});

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
    const res = await api.get(`/tipoObjetoAtributo?tipoObjetoId=${id}`);
    setAtributos(res.data);
    setValoresAtributos({});
  };
  
  const handleChange = (atributoId, valor) => {
    setValoresAtributos(prev => {
      const actualizado = { ...prev, [atributoId]: valor };
      console.log(actualizado);
      return actualizado;
    });
  };
  
  const handleGuardar = async () => {
    for (const ObjetoAtributoID of Object.keys(valoresAtributos)) {
      const data = {
        ObjetoAtributoID: parseInt(ObjetoAtributoID),
        Valor: valoresAtributos[ObjetoAtributoID]
      }; 
      try {
        await api.post(`valorAtributo`, data);
      } catch (error) {
        console.error(`Error guardando atributo ${ObjetoAtributoID}`, error);
      }
    }
  
    alert("Todos los valores fueron guardados");
  };
  
  const transformarDatosDinamicamente = (dispositivo) => {
    if (!dispositivo) return {};
    const formatValue = (val, key = '') => {
      if (val === null || val === undefined) return 'N/A';
      if (typeof val === 'boolean') return val ? 'Sí' : 'No';
      if (typeof val === 'number') {
        if (/(time|date|boot|since|timestamp|created|contact|update|modified|changed)/i.test(key)) {
          try {
            const multiplier = val < 1e12 ? 1000 : 1;
            const date = new Date(val * multiplier);
            return date.toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch {
            return val.toString();
          }
        }
        if (/(size|capacity|space|bytes|memory|ram|disk)/i.test(key)) {
          const units = ['B', 'KB', 'MB', 'GB', 'TB'];
          let unitIndex = 0;
          while (val >= 1024 && unitIndex < units.length - 1) {
            val /= 1024;
            unitIndex++;
          }
          return `${val.toFixed(2)} ${units[unitIndex]}`;
        }
        if (/(speed|clock|frequency|hz)/i.test(key)) {
          const units = ['Hz', 'KHz', 'MHz', 'GHz'];
          let unitIndex = 0;
          while (val >= 1000 && unitIndex < units.length - 1) {
            val /= 1000;
            unitIndex++;
          }
          return `${val.toFixed(2)} ${units[unitIndex]}`;
        }
        if (/(percent|percentage|usage|utilization)/i.test(key) && val <= 1) {
          return `${(val * 100).toFixed(2)}%`;
        }
      }
      return val.toString();
    };
    const processEntry = (key, val, parentKey = '') => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      if (val === null || val === undefined) return null;
      if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
        return {
          label: parentKey ? `${parentKey} > ${label}` : label,
          value: formatValue(val, key),
          rawValue: val
        };
      }
      if (Array.isArray(val)) {
        if (/ipaddresses|macaddresses/i.test(key)) {
          const joined = val.filter(Boolean).map(v => `"${v}"`).join(', ');
          return { label, value: joined || 'N/A' };
        }
        return val.flatMap((item, i) => 
          processEntry(`${label} ${i+1}`, item, parentKey)
        ).filter(Boolean);
      }
      if (typeof val === 'object') {
        return Object.entries(val).flatMap(([k, v]) => 
          processEntry(k, v, parentKey ? `${parentKey} > ${label}` : label)
        );
      }
    };
    const objetoDinamico = {};
    Object.entries(dispositivo).forEach(([key, val]) => {
      const result = processEntry(key, val);
      if (!result) return;
  
      const results = Array.isArray(result) ? result : [result];
      results.forEach(item => {
        const group = /volumes?|processors?/i.test(item.label) 
          ? item.label.split(' ')[0] 
          : item.label.includes('>') ? item.label.split('>')[0].trim() : 'General';
        objetoDinamico[group] = objetoDinamico[group] || [];
        objetoDinamico[group].push(item);
      });
    });
    return objetoDinamico;
  };

  
  const obtenerOpcionesParaSelect = (dispositivo) => {
    if (!dispositivo) return [];
    const listaDispositivo = transformarDatosDinamicamente(dispositivo);
    const opciones = [];
    Object.entries(listaDispositivo).forEach(([seccion, valores]) => {
      valores.forEach(({label, value}) => {
        const safeValue = (value ?? "").replace(/"/g, '');
        const safeLabel = label ?? "Sin etiqueta";
        if (safeValue !== "") {
          opciones.push({
            label: `${safeLabel}: ${safeValue}`,
            value: safeValue
          });
        }
      });
    });
    return opciones;
  };

  const handleSeleccionDispositivo = (dispositivo) => {
    setDispositivoSeleccionado(dispositivo);
  };

  const handleQuitarSeleccionItem = () => {
    setEsquemaSeleccionado("")
    setObjetoSeleccionado("")
    setAtributos([])
  }

  const cerrarModal = () => {
    setDispositivoSeleccionado(null);
    setEsquemaSeleccionado(null)
    setObjetoSeleccionado(null)
    setAtributos([])
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
                <button className="btnAgregar" onClick={handleGuardar}>Agregar</button>
                <button className="btnQuitarSeleccion" onClick={handleQuitarSeleccionItem}>Quitar Seleccion</button>
                <div className="info-grid2">
                  {atributos.map((atributo) => {
                    const opciones = obtenerOpcionesParaSelect(dispositivoSeleccionado);
                    return (
                      <div className="info-item" key={atributo.tipoObjetoAtributoID}>
                        <strong>{atributo.tipoObjetoAtributoID}, {atributo.tipoObjetoAtributo}</strong>
                        <select
                          className="Info-dispositivos"
                          value={valoresAtributos[atributo.tipoObjetoAtributoID] || ""}
                          onChange={(e) => handleChange(atributo.tipoObjetoAtributoID, e.target.value)}
                        >
                          <option value="">-- Seleccionar --</option>
                          {opciones.map((opcion, index) => {
                            const optionValue = opcion.value?.toString() ?? "";
                            return (
                              <option key={`${index}-${optionValue}`} value={optionValue}>
                                {opcion.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
              {Object.entries(transformarDatosDinamicamente(dispositivoSeleccionado)).map(([seccion, datos]) => (
                <div key={seccion}>
                  <h4>{seccion}</h4>
                  <div className="info-grid">
                    {datos?.map(({ label, value }, index) => (
                      <div className="info-item" key={index}>
                        <span className="label">{label}:</span>
                        <span className="value">{value ?? "N/A"}</span>
                      </div>
                    )) || <p>No hay datos disponibles</p>}
                  </div>
                </div>
              ))}
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