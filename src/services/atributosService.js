import api from "../api";

export const esquemaChange = async (setObjetos, id) => {
  if (id) {
    try {
      const respuesta = await api.get(`tipoObjeto?esquemaID=${id}`);
      console.log("Objetos recibidos:", respuesta.data);
      setObjetos(respuesta.data);
    } catch (error) {
      console.error("Error al cargar los objetos:", error);
    }
  } else {
    setObjetos([]);
  }
}

export const objetoChange = async (setAtributos, setValoresAtributos, id) =>{
   const res = await api.get(`/tipoObjetoAtributo?tipoObjetoId=${id}`);
      setAtributos(res.data);
      setValoresAtributos({});
}