import api from "../api";

export const obtenerLocalizaciones = async () => {
    try {
      const response = await api.get("locations");
      setLocalizaciones(response.data);
    } catch (error) {
      console.error("Error al obtener las localizaciones:", error);
    }
  };
  obtenerLocalizaciones();
