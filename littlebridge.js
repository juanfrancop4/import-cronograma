(async () => {
  try {
    const fullUrl = "INSERTE-AQUÍ-EL-ENLACE-DEL-CSV-PUBLICADO";

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error('Error al conectar con Google Sheets: ' + response.status);
    }

    const csvText = await response.text();

    console.log('¡LOGRADO! Datos del CSV recibidos de forma directa:');
    console.log(csvText);

  } catch (error) {
    console.error('Error al procesar la peticion del CSV:', error);
  }
})();
