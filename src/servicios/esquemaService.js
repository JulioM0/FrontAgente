import api from "../api.js";

export const obtenerEsquemas = async () => {
    const response = await api.get("esquemas");
    return(response.data);
};