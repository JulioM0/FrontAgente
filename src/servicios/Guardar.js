import api from "../api";

export const guardar = async (valoresAtributos) => {
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
}