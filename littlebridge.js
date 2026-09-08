(async () => {
  try {
    const fullUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcVmQjXPsPVgYOvUpSiHbFBfyT1h0LUOtoE_UDBG2ijX7qlixuVYb5CTnQcS-WD8db57j8yM1qeuP5/pub?output=csv";

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
