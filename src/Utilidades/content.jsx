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

  const transformarDatosDinamicamente = (dispositivo) => {
    if (!dispositivo) return {};
  
    const objetoDinamico = {};
  
    Object.keys(dispositivo).forEach((clave) => {
      const valor = dispositivo[clave];
      if (typeof valor === "object" && valor !== null) {
        Object.keys(valor).forEach((subClave) => {
          const subValor = valor[subClave];
  
          if (typeof subValor !== "object") {
            if (!objetoDinamico[clave]) objetoDinamico[clave] = [];
            objetoDinamico[clave].push({
              label: subClave.replace(/([A-Z])/g, " $1").trim(),
              value: subValor,
            });
          }
        });
      } 
      else if (Array.isArray(valor)) {
        if (clave.toLowerCase().includes("ip"))
        {
          objetoDinamico[clave] = [
            {
                label: clave.replace(/([A-Z])/g, " $1").trim(),
                value: valor.join(", "),
            },
        ];
        } else {
          objetoDinamico[clave] = [
            {
              label: clave.replace(/([A-Z])/g, " $1").trim(),
              value: valor.join(", "),
            },
          ];
        }
      } 
      else {
        objetoDinamico["General"] = objetoDinamico["General"] || [];
        objetoDinamico["General"].push({
          label: clave.replace(/([A-Z])/g, " $1").trim(),
          value: valor,
        });
      }
    });
  
    return objetoDinamico;
  };

  const obtenerOpcionesParaSelect = (dispositivo) => {
    if (!dispositivo) return [];
    const listaDispositivo = transformarDatosDinamicamente(dispositivo);
    const opciones = [];
    Object.values(listaDispositivo).forEach(seccion => {
      seccion.forEach(({label, value}) => {
        if (value && !opciones.some(op => op.value === value)) {
          opciones.push({
            label: `${label}: ${value}`,
            value: value
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
                <button className="btnAgregar">Agregar</button>
                <button className="btnQuitarSeleccion" onClick={handleQuitarSeleccionItem}>Quitar Seleccion</button>
                  <div className="info-grid2">
                      {atributos.map((atributo) => (
                        <div className="info-item" key={atributo.tipoObjetoAtributoID} value={atributo.tipoObjetoAtributoID}>
                          <strong>{atributo.tipoObjetoAtributoID}, {atributo.tipoObjetoAtributo}</strong>
                          <select className="Info-dispositivos">
                            <option value="">-- Seleccionar --</option>
                            {obtenerOpcionesParaSelect(dispositivoSeleccionado).map((opcion, index) => (
                              <option key={index} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
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