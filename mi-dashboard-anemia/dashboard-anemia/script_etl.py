import pandas as pd
import numpy as np
import os
import glob

# 1. RUTAS
ruta_data = r'C:\Users\laptop\Desktop\universidad\SemestreVII\Bussines Inteligent\data\endes\data_salud'
ruta_destino = 'public/data/'

if not os.path.exists(ruta_destino):
    os.makedirs(ruta_destino)

# 2. FUNCIÓN DE CARGA POR TIPO
def cargar_archivos(tipo):
    lista_df = []
    archivos = glob.glob(os.path.join(ruta_data, f"{tipo}_*.xlsx"))
    for archivo in archivos:
        # Extrae el año del nombre del archivo (ej: "anemia_2016.xlsx" -> 2016)
        anio = os.path.basename(archivo).split('_')[-1].replace('.xlsx', '')
        df = pd.read_excel(archivo)
        df['Anio_Encuesta'] = int(anio)
        lista_df.append(df)
    return pd.concat(lista_df, ignore_index=True)

print("Cargando archivos...")
df_anemia = cargar_archivos('anemia')
df_anemia['Edad_Meses'] = pd.to_numeric(df_anemia['Edad_Meses'], errors='coerce')
df_anemia = df_anemia.dropna(subset=['Edad_Meses']) # Elimina las filas que no tenían una edad válida
df_vivienda = cargar_archivos('vivienda')
df_socio = cargar_archivos('socioeconomico')

# 3. CREAR DIMENSIONES
print("Creando dimensiones...")
DimTiempo = df_anemia[['Anio_Encuesta']].drop_duplicates().sort_values('Anio_Encuesta').reset_index(drop=True)
DimTiempo['TiempoKey'] = DimTiempo.index + 1

DimRegion = df_vivienda[['Region', 'Residencia']].drop_duplicates().reset_index(drop=True)
DimRegion['RegionKey'] = DimRegion.index + 1

DimSocio = df_socio[['SOCIOECONOMICO']].drop_duplicates().dropna().reset_index(drop=True)
DimSocio['SocioKey'] = DimSocio.index + 1

# Edad y Clasificación (basadas en tabla de anemia)
df_anemia['GrupoEdad'] = pd.cut(df_anemia['Edad_Meses'], bins=[0, 5, 11, 23, 35, 47, 59, 100], labels=['<6', '6-11', '12-23', '24-35', '36-47', '48-59', 'Otro'])
DimEdad = df_anemia[['Edad_Meses', 'GrupoEdad']].drop_duplicates().reset_index(drop=True)
DimEdad['EdadKey'] = DimEdad.index + 1

DimClasificacion = df_anemia[['Nivel_Anemia_Cod', 'Nivel_Anemia_Texto']].drop_duplicates().reset_index(drop=True)
DimClasificacion['ClasifKey'] = DimClasificacion.index + 1

# 4. TABLA DE HECHOS
print("Creando hechos...")
Fact = df_anemia.merge(DimTiempo, on='Anio_Encuesta') \
                .merge(DimEdad, on=['Edad_Meses', 'GrupoEdad']) \
                .merge(DimClasificacion, on=['Nivel_Anemia_Cod', 'Nivel_Anemia_Texto'])

# Unir con Vivienda y Socio (usando ID_Caso y Año para asegurar match correcto)
Fact = Fact.merge(df_vivienda[['ID_Caso', 'Anio_Encuesta', 'Region', 'Residencia']], on=['ID_Caso', 'Anio_Encuesta']) \
           .merge(DimRegion, on=['Region', 'Residencia']) \
           .merge(df_socio[['ID_Caso', 'Anio_Encuesta', 'SOCIOECONOMICO']], on=['ID_Caso', 'Anio_Encuesta']) \
           .merge(DimSocio, on='SOCIOECONOMICO')

# Limpiar columnas finales
columnas_finales = ['TiempoKey', 'RegionKey', 'SocioKey', 'ClasifKey', 'EdadKey', 'Hemoglobina', 'Peso_Kg', 'Talla_Cm']
Fact = Fact[columnas_finales]

# 5. EXPORTAR JSONs
print("Exportando a JSON...")
Fact.to_json(os.path.join(ruta_destino, 'fact_anemia.json'), orient='records')
DimTiempo.to_json(os.path.join(ruta_destino, 'dim_tiempo.json'), orient='records')
DimRegion.to_json(os.path.join(ruta_destino, 'dim_region.json'), orient='records')
DimSocio.to_json(os.path.join(ruta_destino, 'dim_socio.json'), orient='records')
DimEdad.to_json(os.path.join(ruta_destino, 'dim_edad.json'), orient='records')
DimClasificacion.to_json(os.path.join(ruta_destino, 'dim_clasificacion.json'), orient='records')

print("¡Proceso terminado con éxito!")