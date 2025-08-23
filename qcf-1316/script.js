document.addEventListener("DOMContentLoaded", () => {
  // --- INICIO: LÓGICA PARA CONECTAR CON APPSHEET ---
  
  const appId = "ef283a04-64e5-4bcb-8418-cc59797f7856";
  const appAccessKey = "V2-6Johj-GSk5e-lZlPM-9TUqL-8dXq6-0SMGT-8MWPB-oOrdo";
  const tableName = "5_Registros_Torque";
  const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

  let registrosDisponibles = [];

  const body = {
    "Action": "Find",
    "Properties": {
      "Locale": "en-US",
      "Filter": "ISBLANK([ID_Protocolo])"
    },
    "Rows": []
  };

  console.log("Iniciando llamada a la API de AppSheet...");

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ApplicationAccessKey': appAccessKey
    },
    body: JSON.stringify(body)
  })
  .then(response => {
    // Punto de control: Vemos la respuesta completa del servidor
    console.log("Respuesta cruda del servidor:", response);
    if (!response.ok) {
      // Si hay un error (ej: 401, 403, 500), lo mostramos
      throw new Error(`Error de Red o API: ${response.status} ${response.statusText}`);
    }
    // Si la respuesta está vacía, no intentamos procesarla
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return []; // Devolvemos una lista vacía para que no falle
    }
    return response.json(); // Solo procesamos si hay contenido
  })
  .then(data => {
    console.log("Datos recibidos y procesados:", data);
    if (data && data.length > 0) {
      registrosDisponibles = data;
      const isometricosUnicos = [...new Set(data.map(row => row.ID_Isometrico))];
      llenarSelectIsometricos(isometricosUnicos);
    } else {
      console.log("No se encontraron registros de torque disponibles (la respuesta estaba vacía pero fue manejada).");
    }
  })
  .catch(error => {
    console.error('Error final en la llamada a la API:', error);
  });

  function llenarSelectIsometricos(lista) {
    const select = document.getElementById("isometrico");
    select.innerHTML = '<option value="">-- Selecciona un Isométrico --</option>';
    lista.forEach(valor => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });
  }
  
  const selectIsometrico = document.getElementById("isometrico");
  
  selectIsometrico.addEventListener('change', () => {
    const isometricoSeleccionado = selectIsometrico.value;
    
    if (isometricoSeleccionado) {
      const registrosFiltrados = registrosDisponibles.filter(
        registro => registro.ID_Isometrico === isometricoSeleccionado
      );
      
      // Creamos el valor "Diámetro-Rating" localmente
      const diametrosUnicos = [...new Set(
        registrosFiltrados.map(registro => `${registro.Diametro_Nominal}-${registro.Rating}`)
      )];
      
      llenarSelectDiametroRating(diametrosUnicos);
    } else {
      llenarSelectDiametroRating([]);
    }
  });

  function llenarSelectDiametroRating(lista) {
    const select = document.getElementById("diametroRating");
    select.innerHTML = '<option value="">-- Selecciona Diámetro y Rating --</option>';
    lista.forEach(valor => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });
  }

  // --- FIN: LÓGICA PARA CONECTAR CON APPSHEET ---


  // --- TU LÓGICA ORIGINAL PARA EL FORMULARIO ---
  const rango = [1, 2, 3, 4, 5, 6, 7];
  rango.forEach(num => {
    // ... (tu código para los checkboxes se mantiene aquí sin cambios) ...
  });
});
  // --- FIN: LÓGICA PARA CONECTAR CON APPSHEET ---


  // --- INICIO: TU LÓGICA ORIGINAL PARA EL FORMULARIO ---
  const rango = [1, 2, 3, 4, 5, 6, 7];
  rango.forEach(num => {
    const campo30 = document.getElementById(`flangeJoint${num}_30`);
    const campo70 = document.getElementById(`flangeJoint${num}_70`);
    const campo100 = document.getElementById(`flangeJoint${num}_100`);
    const check30 = document.getElementById(`torque30_${num}`);
    const check70 = document.getElementById(`torque70_${num}`);
    const check100 = document.getElementById(`torque100_${num}`);
    const campoPrincipal = document.getElementById(`flangeJoint${num}`);
    const gap1 = document.getElementById(`gap1_${num}`);
    const gap2 = document.getElementById(`gap2_${num}`);
    const gapFinal = document.getElementById(`gapFinal_${num}`);

    if (campo30 && check30) {
      campo30.addEventListener("input", () => { check30.checked = campo30.value.trim() !== ""; });
    }
    if (campo70 && check70) {
      campo70.addEventListener("input", () => { check70.checked = campo70.value.trim() !== ""; });
    }
    if (campo100 && check100) {
      campo100.addEventListener("input", () => { check100.checked = campo100.value.trim() !== ""; });
    }
    if (campoPrincipal) {
      campoPrincipal.addEventListener("input", () => {
        const tieneValor = campoPrincipal.value.trim() !== "";
        [gap1, gap2, gapFinal].forEach(gap => { if (gap) gap.checked = tieneValor; });
      });
    }
  });
  // --- FIN: TU LÓGICA ORIGINAL PARA EL FORMULARIO ---
});