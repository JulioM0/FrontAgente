import api from "../api";

export const obtenerLocalizaciones = async (setLocalizaciones) => {
  try {
    const response = await api.get("locations");
    setLocalizaciones(response.data);
  } catch (error) {
    console.error("Error al obtener las localizaciones:", error);
  }
};
