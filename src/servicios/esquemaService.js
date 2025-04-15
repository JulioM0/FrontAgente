import api from "../api.js";

export const obtenerEsquemas = async (setEsquemas) => {
      try{
        const response = await api.get("esquemas");
        setEsquemas(response.data);
      }
      catch (error){
        console.error("Error al obtener los esquemas", error)
      }
};
