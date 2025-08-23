document.addEventListener("DOMContentLoaded", () => {
  // --- INICIO: LÓGICA PARA CONECTAR CON APPSHEET ---
  
  const appId = "ef283a04-64e5-4bcb-8418-cc59797f7856";
  const appAccessKey = "V2-6Johj-GSk5e-lZlPM-9TUqL-8dXq6-0SMGT-8MWPB-oOrdo";
  const tableName = "5_Registros_Torque";
  const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

  // Guardaremos todos los registros disponibles para luego filtrarlos
  let registrosDisponibles = [];

  // --- BODY de la llamada ---
  const body = {
    "Action": "Find",
    "Properties": {
      "Locale": "en-US",
      // 👇 Traemos solo filas que no tengan protocolo asociado
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
    if (!response.ok) {
      throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("✅ Datos recibidos desde AppSheet:", data);

    if (data && data.length > 0) {
      registrosDisponibles = data; // Guardamos todos los registros
      // Obtenemos los isométricos únicos
      const isometricosUnicos = [...new Set(data.map(row => row.ID_Isometrico))];
      llenarSelectIsometricos(isometricosUnicos);
    } else {
      console.log("⚠️ No se encontraron registros de torque disponibles.");
    }
  })
  .catch(error => {
    console.error('❌ Error al obtener datos de AppSheet:', error);
  });

  // --- SELECT DE ISOMÉTRICOS ---
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

  // --- SELECT DE DIÁMETRO-RATING (segundo select dependiente) ---
  const selectIsometrico = document.getElementById("isometrico");
  
  selectIsometrico.addEventListener('change', () => {
    const isometricoSeleccionado = selectIsometrico.value;
    
    if (isometricoSeleccionado) {
      // Filtramos solo registros con ese isométrico
      const registrosFiltrados = registrosDisponibles.filter(
        registro => registro.ID_Isometrico === isometricoSeleccionado
      );
      
      // Construimos la lista única de "Diámetro-Rating"
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

  // --- FIN LÓGICA APPSHEET ---


  // --- INICIO: LÓGICA PARA CHECKS Y CAMPOS DEL FORMULARIO ---
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

    // --- Torque 30% ---
    if (campo30 && check30) {
      campo30.addEventListener("input", () => {
        check30.checked = campo30.value.trim() !== "";
      });
    }

    // --- Torque 70% ---
    if (campo70 && check70) {
      campo70.addEventListener("input", () => {
        check70.checked = campo70.value.trim() !== "";
      });
    }

    // --- Torque 100% ---
    if (campo100 && check100) {
      campo100.addEventListener("input", () => {
        check100.checked = campo100.value.trim() !== "";
      });
    }

    // --- Gaps (se marcan si hay valor en el campo principal) ---
    if (campoPrincipal) {
      campoPrincipal.addEventListener("input", () => {
        const tieneValor = campoPrincipal.value.trim() !== "";
        [gap1, gap2, gapFinal].forEach(gap => {
          if (gap) gap.checked = tieneValor;
        });
      });
    }
  });

  // --- FIN LÓGICA FORMULARIO ---
});
