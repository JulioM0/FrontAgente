import api from "../api";

export const obtenerDispositivosPorLocalizacion = async (id) => {
  const response = await api.get(`devices?id=${id}`);
  return response.data;
};
