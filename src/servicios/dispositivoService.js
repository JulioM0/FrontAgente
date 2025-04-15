import api from "../api";

export const obtenerDispositivos = async (setDispositivos, localizacionSeleccionada) => {
      if (!localizacionSeleccionada) return;
      try {
        const response = await api.get(`devices?id=${localizacionSeleccionada}`);
        setDispositivos(response.data);
      } catch (error) {
        console.error("Error al obtener los dispositivos:", error);
      }
    };

export const contarDispositivos = async (setDispositivosPorLocalizacion, localizaciones) => {
  try{
    const promesas = localizaciones.map((localizacion) =>
      api.get(`devices?id=${localizacion.id}`).then((response) => ({
        id: localizacion.id,
        total: response.data.length,
      }))
    );
    const resultado = await Promise.all(promesas);
    const conteo = resultado.reduce((acc, {id, total }) => {
      acc[id] = total;
      return acc;
    }, {})

    setDispositivosPorLocalizacion(conteo);
  }
  catch (error){
    console.error("Error al obtener los dispositivos", error);
  }
};

