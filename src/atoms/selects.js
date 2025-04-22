import React from 'react';

 export const EsquemaSelect = ({ esquemas, esquemaSeleccionado, onChange }) => {
  return (
    <select onChange={onChange} value={esquemaSeleccionado} className="Esquemas">
      <option value="">Selecciona un Esquema</option>
      {esquemas.map((esquema) => (
        <option key={esquema.esquemaID} value={esquema.esquemaID}>
          {esquema.esquema}
        </option>
      ))}
    </select>
  );
};

export const ObjetoSelect = ({ objetos, objetoSeleccionado, onChange }) => {
    return (
      <select disabled={objetos.length === 0} onChange={onChange} value={objetoSeleccionado} className="Objetos">
        <option value="">-- Seleccionar --</option>
            {objetos.length > 0 &&
                objetos.map((objeto) => (
                <option key={objeto.tipoObjetoID} value={objeto.tipoObjetoID}>
                    {objeto.tipoObjeto}
                </option>
          ))}
      </select>
    );
  };
  
export const AtributoSelect = ({ atributo, opciones, valorSeleccionado, onChange }) => {
    return (
      <div className="info-item">
        <strong>{atributo.tipoObjetoAtributoID}, {atributo.tipoObjetoAtributo}</strong>
        <select
          className="Info-dispositivos"
          value={valorSeleccionado}
          onChange={(e) => onChange(atributo.tipoObjetoAtributoID, e.target.value)}
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
  };