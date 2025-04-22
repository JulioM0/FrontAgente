
export const transformarDatosDinamicamente = (dispositivo) => {
    if (!dispositivo) return {};
    const formatValue = (val, key = '') => {
      if (val === null || val === undefined) return 'N/A';
      if (typeof val === 'boolean') return val ? 'Sí' : 'No';
      if (typeof val === 'number') {
        if (/(time|date|boot|since|timestamp|created|contact|update|modified|changed)/i.test(key)) {
          try {
            const multiplier = val < 1e12 ? 1000 : 1;
            const date = new Date(val * multiplier);
            return date.toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch {
            return val.toString();
          }
        }
        if (/(size|capacity|space|bytes|memory|ram|disk)/i.test(key)) {
          const units = ['B', 'KB', 'MB', 'GB', 'TB'];
          let unitIndex = 0;
          while (val >= 1024 && unitIndex < units.length - 1) {
            val /= 1024;
            unitIndex++;
          }
          return `${val.toFixed(2)} ${units[unitIndex]}`;
        }
        if (/(speed|clock|frequency|hz)/i.test(key)) {
          const units = ['Hz', 'KHz', 'MHz', 'GHz'];
          let unitIndex = 0;
          while (val >= 1000 && unitIndex < units.length - 1) {
            val /= 1000;
            unitIndex++;
          }
          return `${val.toFixed(2)} ${units[unitIndex]}`;
        }
        if (/(percent|percentage|usage|utilization)/i.test(key) && val <= 1) {
          return `${(val * 100).toFixed(2)}%`;
        }
      }
      return val.toString();
    };
    const processEntry = (key, val, parentKey = '') => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      if (val === null || val === undefined) return null;
      if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
        return {
          label: parentKey ? `${parentKey} > ${label}` : label,
          value: formatValue(val, key),
          rawValue: val
        };
      }
      if (Array.isArray(val)) {
        if (/ipaddresses|macaddresses/i.test(key)) {
          const joined = val.filter(Boolean).map(v => `"${v}"`).join(', ');
          return { label, value: joined || 'N/A' };
        }
        return val.flatMap((item, i) => 
          processEntry(`${label} ${i+1}`, item, parentKey)
        ).filter(Boolean);
      }
      if (typeof val === 'object') {
        return Object.entries(val).flatMap(([k, v]) => 
          processEntry(k, v, parentKey ? `${parentKey} > ${label}` : label)
        );
      }
    };
    const objetoDinamico = {};
    Object.entries(dispositivo).forEach(([key, val]) => {
      const result = processEntry(key, val);
      if (!result) return;
  
      const results = Array.isArray(result) ? result : [result];
      results.forEach(item => {
        const group = /volumes?|processors?/i.test(item.label) 
          ? item.label.split(' ')[0] 
          : item.label.includes('>') ? item.label.split('>')[0].trim() : 'General';
        objetoDinamico[group] = objetoDinamico[group] || [];
        objetoDinamico[group].push(item);
      });
    });
    return objetoDinamico;
  };

  export const obtenerOpcionesParaSelect = (dispositivo, valoresSeleccionados, atributoIdActual) => {
      if (!dispositivo) return [];
      const listaDispositivo = transformarDatosDinamicamente(dispositivo);
      const opciones = [];
  
      const valoresSeleccionadosSet = new Set(
        Object.entries(valoresSeleccionados)
          .filter(([id, val]) => id !== atributoIdActual.toString()) 
          .map(([_, val]) => val)
      );
  
      Object.entries(listaDispositivo).forEach(([seccion, valores]) => {
        valores.forEach(({label, value}) => {
          const safeValue = (value ?? "").replace(/"/g, '');
          const safeLabel = label ?? "Sin etiqueta";
          if (safeValue !== "" && !valoresSeleccionadosSet.has(safeValue)) {
            opciones.push({
              label: `${safeLabel}: ${safeValue}`,
              value: safeValue
            });
          }
        });
      });
      return opciones;
    };
