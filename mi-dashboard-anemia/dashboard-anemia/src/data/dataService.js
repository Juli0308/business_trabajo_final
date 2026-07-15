// src/data/dataService.js
// Servicio de datos que lee del ETL real

let cache = {
  dimTiempo: [],
  dimRegion: [],
  dimSocio: [],
  dimEdad: [],
  dimClasificacion: [],
  factAnemia: [],
  loaded: false
};

// Cargar todos los datos al inicializar
export const loadAllData = async () => {
  if (cache.loaded) return cache;
  
  try {
    const [tiempo, region, socio, edad, clasificacion, fact] = await Promise.all([
      fetch('/data/dim_tiempo.json').then(r => r.json()),
      fetch('/data/dim_region.json').then(r => r.json()),
      fetch('/data/dim_socio.json').then(r => r.json()),
      fetch('/data/dim_edad.json').then(r => r.json()),
      fetch('/data/dim_clasificacion.json').then(r => r.json()),
      fetch('/data/fact_anemia.json').then(r => r.json()),
    ]);

    cache = {
      dimTiempo: tiempo,
      dimRegion: region,
      dimSocio: socio,
      dimEdad: edad,
      dimClasificacion: clasificacion,
      factAnemia: fact,
      loaded: true
    };
    console.log("dimTiempo:", tiempo.length);
    console.log("dimRegion:", region.length);
    console.log("dimClasificacion:", clasificacion.length);
    console.log("fact:", fact.length);
    console.log(fact);

    return cache;
  } catch (error) {
    console.error('Error cargando datos:', error);
    return cache;
  }
};

// Obtener años disponibles
export const getAnosDisponibles = () => {
  const data = cache.dimTiempo;
  return data.map(d => d.Anio_Encuesta).sort();
};

// Obtener regiones (departamentos) sin duplicados
export const getRegionesDisponibles = () => {
  const data = cache.dimRegion;
  const regiones = [...new Set(data.map(d => d.Region))].sort();
  return ['Todos', ...regiones];
};

// Obtener niveles socioeconómicos
export const getNivelesSocio = () => {
  const data = cache.dimSocio;
  return data.map(d => d.SOCIOECONOMICO).sort();
};

// Obtener grupos de edad
export const getGruposEdad = () => {
  const edadMap = {
    '<6': 'Menor de 6 meses',
    '6-11': '6-11 meses',
    '12-23': '12-23 meses',
    '24-35': '24-35 meses',
    '36-47': '36-47 meses',
    '48-59': '48-59 meses',
    'Otro': 'Otro'
  };
  
  const grupos = [...new Set(cache.dimEdad.map(d => d.GrupoEdad))];
  return grupos.map(g => edadMap[g] || g).sort();
};

// Función auxiliar para lookup
const getLookupMaps = () => {
  const tiempoMap = {};
  const regionMap = {};
  const socioMap = {};
  const edadMap = {};
  const clasificacionMap = {};

  cache.dimTiempo.forEach(d => tiempoMap[d.TiempoKey] = d.Anio_Encuesta);
  cache.dimRegion.forEach(d => regionMap[d.RegionKey] = d);
  cache.dimSocio.forEach(d => socioMap[d.SocioKey] = d.SOCIOECONOMICO);
  cache.dimEdad.forEach(d => edadMap[d.EdadKey] = d);
  cache.dimClasificacion.forEach(d => clasificacionMap[d.ClasifKey] = d.Nivel_Anemia_Texto);

  return { tiempoMap, regionMap, socioMap, edadMap, clasificacionMap };
};

// Calcular prevalencia por región y año
export const getPrevalenciasPorRegion = () => {
  const { tiempoMap, regionMap, clasificacionMap } = getLookupMaps();
  const prevalencias = {};

  cache.factAnemia.forEach(fact => {
    const ano = tiempoMap[fact.TiempoKey];
    const region = regionMap[fact.RegionKey];
    const clasificacion = clasificacionMap[fact.ClasifKey];
    
    if (!region || !ano) return;

    const key = `${region.Region}_${ano}`;
    if (!prevalencias[key]) {
      prevalencias[key] = { total: 0, conAnemia: 0, region: region.Region, ano, residencia: region.Residencia };
    }

    prevalencias[key].total++;
    if (clasificacion !== 'Sin anemia') {
      prevalencias[key].conAnemia++;
    }
  });

  // Convertir a porcentaje
  const resultado = {};
  Object.values(prevalencias).forEach(item => {
    const key = `${item.region}_${item.ano}`;
    if (!resultado[key]) {
      resultado[key] = { total: 0, conAnemia: 0, region: item.region, ano: item.ano, prevalencia: 0 };
    }
    resultado[key].total += item.total;
    resultado[key].conAnemia += item.conAnemia;
    resultado[key].prevalencia = parseFloat(((resultado[key].conAnemia / resultado[key].total) * 100).toFixed(1));
  });

  return Object.values(resultado);
};

// Evolución histórica por región
export const getEvolucionHistorica = (region = null) => {
  const { tiempoMap, regionMap, clasificacionMap } = getLookupMaps();
  const evolucion = {};

  cache.factAnemia.forEach(fact => {
    const ano = tiempoMap[fact.TiempoKey];
    const reg = regionMap[fact.RegionKey];
    const clasificacion = clasificacionMap[fact.ClasifKey];
    
    if (!reg || !ano) return;
    if (region && region !== 'Todos' && reg.Region !== region) return;

    const key = ano;
    if (!evolucion[key]) {
      evolucion[key] = { year: ano, total: 0, conAnemia: 0 };
    }

    evolucion[key].total++;
    if (clasificacion !== 'Sin anemia') {
      evolucion[key].conAnemia++;
    }
  });

  return Object.values(evolucion)
    .sort((a, b) => a.year - b.year)
    .map(item => ({
      year: item.year,
      prevalencia: parseFloat(((item.conAnemia / item.total) * 100).toFixed(1))
    }));
};

// Distribución por nivel socioeconómico
export const getDistribucionSocioeconomico = () => {
  const { socioMap, clasificacionMap } = getLookupMaps();
  const distribucion = {};

  cache.factAnemia.forEach(fact => {
    const socio = socioMap[fact.SocioKey];
    const clasificacion = clasificacionMap[fact.ClasifKey];
    
    if (!socio) return;

    if (!distribucion[socio]) {
      distribucion[socio] = { total: 0, conAnemia: 0, nivel: socio };
    }

    distribucion[socio].total++;
    if (clasificacion !== 'Sin anemia') {
      distribucion[socio].conAnemia++;
    }
  });

  return Object.values(distribucion)
    .map(item => ({
      nivel: item.nivel,
      prevalencia: parseFloat(((item.conAnemia / item.total) * 100).toFixed(1)),
      casos: item.conAnemia,
      total: item.total
    }))
    .sort((a, b) => b.prevalencia - a.prevalencia);
};

// Distribución por grupo de edad
export const getDistribucionPorEdad = () => {
  const { edadMap, clasificacionMap } = getLookupMaps();
  const distribucion = {};

  cache.factAnemia.forEach(fact => {
    const edad = edadMap[fact.EdadKey];
    const clasificacion = clasificacionMap[fact.ClasifKey];
    
    if (!edad) return;

    const grupo = edad.GrupoEdad;
    if (!distribucion[grupo]) {
      distribucion[grupo] = { grupo, total: 0, conAnemia: 0 };
    }

    distribucion[grupo].total++;
    if (clasificacion !== 'Sin anemia') {
      distribucion[grupo].conAnemia++;
    }
  });

  const grupoOrder = ['<6', '6-11', '12-23', '24-35', '36-47', '48-59', 'Otro'];
  return grupoOrder
    .filter(g => distribucion[g])
    .map(g => ({
      grupo: g,
      casos: distribucion[g].total,
      prevalencia: parseFloat(((distribucion[g].conAnemia / distribucion[g].total) * 100).toFixed(1))
    }));
};

// Clasificación clínica
export const getClasificacionClinica = () => {
  const { clasificacionMap } = getLookupMaps();
  const clasificacion = {};

  cache.factAnemia.forEach(fact => {
    const clasif = clasificacionMap[fact.ClasifKey];
    if (!clasif) return;

    if (!clasificacion[clasif]) {
      clasificacion[clasif] = 0;
    }
    clasificacion[clasif]++;
  });

  const total = Object.values(clasificacion).reduce((a, b) => a + b, 0);

  return Object.entries(clasificacion)
    .map(([categoria, casos]) => ({
      categoria,
      casos,
      porcentaje: parseFloat(((casos / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.casos - a.casos);
};

// Total de niños evaluados
export const getTotalNinios = () => {
  return cache.factAnemia.length;
};

// Calcular KPIs generales
export const calcularKPIsGenerales = () => {
  const { clasificacionMap } = getLookupMaps();
  let totalNinios = 0;
  let conAnemia = 0;
  let anemiaLeve = 0;
  let anemiaModera = 0;

  cache.factAnemia.forEach(fact => {
    const clasificacion = clasificacionMap[fact.ClasifKey];
    totalNinios++;
    
    if (clasificacion === 'Leve') anemiaLeve++;
    if (clasificacion === 'Moderado') anemiaModera++;
    if (clasificacion !== 'Sin anemia') conAnemia++;
  });

  return {
    totalNinios,
    conAnemia,
    anemiaLeve,
    anemiaModera,
    prevalencia: parseFloat(((conAnemia / totalNinios) * 100).toFixed(1))
  };
};

// Ranking de regiones con mayor mejora
export const getRankingMejora = () => {
  const evoluciones = {};
  const { regionMap, clasificacionMap, tiempoMap } = getLookupMaps();

  cache.factAnemia.forEach(fact => {
    const region = regionMap[fact.RegionKey]?.Region;
    const ano = tiempoMap[fact.TiempoKey];
    const clasificacion = clasificacionMap[fact.ClasifKey];
    
    if (!region || !ano) return;

    if (!evoluciones[region]) {
      evoluciones[region] = {};
    }
    if (!evoluciones[region][ano]) {
      evoluciones[region][ano] = { total: 0, conAnemia: 0 };
    }

    evoluciones[region][ano].total++;
    if (clasificacion !== 'Sin anemia') {
      evoluciones[region][ano].conAnemia++;
    }
  });

  // Calcular mejora (reducción porcentual desde primer año al último)
  const ranking = Object.entries(evoluciones).map(([region, anoData]) => {
    const anos = Object.keys(anoData).map(Number).sort();
    if (anos.length < 2) return null;

    const primerAno = anoData[anos[0]];
    const ultimoAno = anoData[anos[anos.length - 1]];

    const prevPrimero = (primerAno.conAnemia / primerAno.total) * 100;
    const prevUltimo = (ultimoAno.conAnemia / ultimoAno.total) * 100;
    const reduccion = prevPrimero - prevUltimo;

    return { region, reduccion: parseFloat(reduccion.toFixed(1)), anoInicio: anos[0], anoFin: anos[anos.length - 1] };
  });

  return ranking
    .filter(r => r !== null)
    .sort((a, b) => b.reduccion - a.reduccion)
    .slice(0, 10);
};

// Función para filtrar datos por criterios
export const filtrarDatos = (filtros = {}) => {
  const { regionMap, clasificacionMap, tiempoMap } = getLookupMaps();
  const { year, region, residencia } = filtros;

  return cache.factAnemia.filter(fact => {
    const ano = tiempoMap[fact.TiempoKey];
    const reg = regionMap[fact.RegionKey];

    if (year && year !== 'Todos' && ano !== parseInt(year)) return false;
    if (region && region !== 'Todos' && reg.Region !== region) return false;
    if (residencia && residencia !== 'Todos' && reg.Residencia !== residencia) return false;

    return true;
  });
};

// Calcular KPIs filtrados
export const calcularKPIsFiltrados = (filtros) => {
  const { clasificacionMap } = getLookupMaps();
  const datosFiltrados = filtrarDatos(filtros);

  let totalNinios = datosFiltrados.length;
  let conAnemia = 0;
  let anemiaLeve = 0;
  let anemiaModera = 0;

  datosFiltrados.forEach(fact => {
    const clasificacion = clasificacionMap[fact.ClasifKey];
    if (clasificacion === 'Leve') anemiaLeve++;
    if (clasificacion === 'Moderado') anemiaModera++;
    if (clasificacion !== 'Sin anemia') conAnemia++;
  });

  return {
    totalNinios,
    conAnemia,
    anemiaLeve,
    anemiaModera,
    prevalencia: totalNinios > 0 ? parseFloat(((conAnemia / totalNinios) * 100).toFixed(1)) : 0
  };
};

// Agregar esta función a dataService.js

// Reemplazar la función calcularPrevalenciaPorRegion completa:

export const calcularPrevalenciaPorRegion = (filtros = {}) => {
  const { regionMap, clasificacionMap, tiempoMap } = getLookupMaps();
  const { year, residencia } = filtros;

  console.log("Filtros:", filtros);
  console.log("Total fact:", cache.factAnemia.length);

  const prevalenciaPorRegion = {};

  let contador = 0;

cache.factAnemia.forEach(fact => {

  contador++;

  if (contador <= 5) {
    console.log("FACT", fact);

    console.log("Año:", tiempoMap[fact.TiempoKey]);
    console.log("Región:", regionMap[fact.RegionKey]);
    console.log("Clasificación:", clasificacionMap[fact.ClasifKey]);
  }

  const ano = tiempoMap[fact.TiempoKey];
  const reg = regionMap[fact.RegionKey];
  const clasificacion = clasificacionMap[fact.ClasifKey];

    console.log({
      TiempoKey: fact.TiempoKey,
      RegionKey: fact.RegionKey,
      ClasifKey: fact.ClasifKey,
      ano,
      reg,
      clasificacion
    });

    console.log("Año:", ano, "Filtro:", year);

    if (!reg) {
      console.log("Sin región");
      return;
    }

    if (year && year !== 'Todos' && ano !== parseInt(year)) {
      console.log("Descartado por año");
      return;
    }

    if (residencia && residencia !== 'Todos' && reg.Residencia !== residencia) {
      console.log("Descartado por residencia");
      return;
    }

    console.log("Entra:", reg.Region);

    const region = reg.Region;

    if (!prevalenciaPorRegion[region]) {
      prevalenciaPorRegion[region] = {
        region,
        total: 0,
        conAnemia: 0
      };
    }

    prevalenciaPorRegion[region].total++;

    if (clasificacion !== 'Sin anemia') {
      prevalenciaPorRegion[region].conAnemia++;
    }
  });

  console.log("OBJETO FINAL:", prevalenciaPorRegion);

  return Object.values(prevalenciaPorRegion).map(item => ({
    ...item,
    prevalencia: Number(((item.conAnemia / item.total) * 100).toFixed(1))
  }));
};

// Agregar esta función auxiliar para normalizar nombres de departamentos

export const normalizarNombreDepartamento = (nombre) => {
  if (!nombre) return "";

  return nombre
    .normalize("NFD")               // separa letras y tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina las tildes
    .trim()
    .toUpperCase();
};