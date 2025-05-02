import React, { useEffect, useState } from "react";
import {obtenerEsquemas} from "../services/esquemaService.js"
import {esquemaChange, objetoChange} from "../services/atributosService.js";
import {obtenerLocalizaciones} from "../services/localizacionService.js";
import {obtenerDispositivos, contarDispositivos} from "../services/dispositivoService.js";
import { guardar} from "../services/Guardar.js";
import { transformarDatosDinamicamente, obtenerOpcionesParaSelect } from "../others/extras/transformarDatos.js";
import {Button} from "../atoms/button.js";
import {EsquemaSelect, ObjetoSelect, AtributoSelect} from "../atoms/selects.js";
import { LocalizacionItem } from "../molecules/localizaciones.js";
import { DispositivoItem } from "../molecules/dispositivos.js";
import "../others/Estilos/content.css";

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
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState(dispositivos);

  useEffect(() => {
    obtenerEsquemas(setEsquemas);
    obtenerLocalizaciones(setLocalizaciones);
  },[]);

  useEffect(() => {
    obtenerDispositivos(setDispositivos, localizacionSeleccionada, setResultadosBusqueda)
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

  const handleBusqueda = (e) => {
    const text = e.target.value;
    setBusqueda(text);
  
    if (text.trim() === "") {
      setResultadosBusqueda(dispositivos);
    } else {
      const resultados = dispositivos.filter((dispositivo) => {
        const nombre = dispositivo.systemName?.toLowerCase() || "";
        const ip = dispositivo.ipAddresses?.toString().toLowerCase() || "";
        const ipPublic = dispositivo.publicIP?.toLowerCase() || "";
        const termino = text.toLowerCase();
  
        return nombre.includes(termino) || ip.includes(termino) || ipPublic.includes(termino);
      });
      setResultadosBusqueda(resultados);
    }
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
    const validarDatos = atributos.some((atributo) => {
      const valor = valoresAtributos[atributo.tipoObjetoAtributoID]
      return !valor || valor === "-Seleccionar-"
    })
    if (validarDatos){
      alert("Faltan datos por seleccionar")
    }else {
      guardar(valoresAtributos);
    }
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
            <LocalizacionItem
              key={localizacion.id}
              localizacion={localizacion}
              seleccionada={localizacionSeleccionada === localizacion.id}
              onSeleccionar={handleSeleccionLoc}
              cantidad={dispositivosPorLocalizacion[localizacion.id] || 0}
            />
          ))}
        </div>
      </div>
        {dispositivos.length > 0 && (
          <div className="dispositivos">
            <h1 className="titulo-dispositivos">Dispositivos</h1>
            <input className="Busqueda" type="text" placeholder="Ingresa el nombre o la IP de un dispositivo" onChange={handleBusqueda} value={busqueda}/>
            <div className="lista-dispositivos">
              {resultadosBusqueda.map((dispositivo) => (
              <DispositivoItem
              key={dispositivo.id}
              dispositivo={dispositivo}
              seleccionado={dispositivoSeleccionado === dispositivo.systemName}
              onSeleccionar={handleSeleccionDispositivo}
            />
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
                <EsquemaSelect
                  esquemas={esquemas}
                  esquemaSeleccionado={esquemaSeleccionado}
                  onChange={handleEsquemaChange}
                />
                <ObjetoSelect
                  objetos={objetos}
                  objetoSeleccionado={objetoSeleccionado}
                  onChange={handleObjetoChange}
                />
                <Button className="btnAgregar" onClick={handleGuardar}>Agregar</Button>
                <Button className="btnQuitarSeleccion" onClick={handleQuitarSeleccionItem}>Quitar Seleccion</Button>
                <div className="info-grid2">
                  {atributos.map((atributo) => {
                    const opciones = obtenerOpcionesParaSelect(dispositivoSeleccionado, valoresAtributos, atributo.tipoObjetoAtributoID);
                    return (
                      <AtributoSelect
                        key={atributo.tipoObjetoAtributoID}
                        atributo={atributo}
                        opciones={opciones}
                        valorSeleccionado={valoresAtributos[atributo.tipoObjetoAtributoID] || ""}
                        onChange={handleChange}
                      />
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
              <Button className="btn-cerrar" onClick={cerrarModal}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>  
  </div>
  );
};
export default Contenido;