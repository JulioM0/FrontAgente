import React, { useEffect, useState } from "react";
import {obtenerEsquemas} from "../servicios/esquemaService.js"
import {esquemaChange, objetoChange} from "../servicios/atributosService.js";
import {obtenerLocalizaciones} from "../servicios/localizacionService.js";
import {obtenerDispositivos, contarDispositivos} from "../servicios/dispositivoService.js";
import { guardar} from "../servicios/Guardar.js";
import { transformarDatosDinamicamente, obtenerOpcionesParaSelect } from "../extras/transformarDatos.js";
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
    obtenerEsquemas(setEsquemas);
    obtenerLocalizaciones(setLocalizaciones);
  },[]);

  useEffect(() => {
    obtenerDispositivos(setDispositivos, localizacionSeleccionada)
  }, [localizacionSeleccionada], );

  useEffect(() => {
    if (localizaciones.length > 0) {
      contarDispositivos(setDispositivosPorLocalizacion, localizaciones)
    }
  }, [localizaciones])

  const handleSeleccionLoc = (id) => {
    setLocalizacionSeleccionada(id);
    setDispositivos([]);
    setDispositivoSeleccionado(null);
  };

  const handleEsquemaChange = async (e) => {
    const id = e.target.value;
    setEsquemaSeleccionado(id);
    esquemaChange(setObjetos, id);
  };

  const handleObjetoChange = async (e) => {
    const id = e.target.value;
    setObjetoSeleccionado(id);
    objetoChange(setAtributos, setValoresAtributos, id)
  };

  const handleChange = (atributoId, valor) => {
    setValoresAtributos(prev => {
      const actualizado = { ...prev, [atributoId]: valor };
      construirObjeto(actualizado);
      return actualizado;
    });
  };
  
  const handleGuardar = async () => {
    guardar(valoresAtributos);
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

  const construirObjeto = (valores = valoresAtributos) => {
    const objeto = {
      Descripcion: dispositivoSeleccionado?.systemName || "Sin nombre",
      ProductoInventarioID: 0,
      ObjetoAtributos: {
        ObjetoAtributos: atributos.map((atributo) => {
          const valorSeleccionado = valores[atributo.tipoObjetoAtributoID] || "";
          return {
            ObjetoAtributoID: atributo.tipoObjetoAtributoID,
            TipoObjetoAtributoID: atributo.tipoObjetoAtributoID,
            ObjetoID: objetoSeleccionado || 0,
            Valor: valorSeleccionado,
            TipoAtributo: "Predeterminado"
          };
        })
      }
    };
    console.log("Objeto actualizado:", objeto);
  };

  return (
    <div className="Contenido">
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
                    const opciones = obtenerOpcionesParaSelect(dispositivoSeleccionado, valoresAtributos, atributo.tipoObjetoAtributoID);
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