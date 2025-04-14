import api from "../api";

export const obtenerObjetosPorEsquema = async (id) => {
  const response = await api.get(`tipoObjeto?esquemaID=${id}`);
  return response.data;
};

export const obtenerAtributosPorObjeto = async (id) => {
  const response = await api.get(`/tipoObjetoAtributo?tipoObjetoId=${id}`);
  return response.data;
};

export const guardarValorAtributo = async (data) => {
  await api.post(`valorAtributo`, data);
};
