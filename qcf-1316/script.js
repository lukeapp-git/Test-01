
document.addEventListener("DOMContentLoaded", () => {
  const appId = "ef283a04-64e5-4bcb-8418-cc59797f7856";
  const appAccessKey = "V2-6Johj-GSk5e-lZlPM-9TUqL-8dXq6-0SMGT-8MWPB-oOrdo";
  
  // URLs para las diferentes tablas
  const urlRegistros = `https://api.appsheet.com/api/v2/apps/${appId}/tables/5_Registros_Torque/Action`;
  const urlProtocolos = `https://api.appsheet.com/api/v2/apps/${appId}/tables/6. Protocolos/Action`;

  const body = {
    "Action": "Find",
    "Properties": { "Locale": "en-US" },
    "Rows": []
  };

  let todosLosRegistros = [];
  let todosLosProtocolos = [];

  // Función para hacer peticiones a AppSheet
  async function fetchAppSheet(url) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApplicationAccessKey': appAccessKey
        },
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return [];
    }
  }

  // Cargar datos iniciales
  async function cargarDatosIniciales() {
    // Cargar registros
    todosLosRegistros = await fetchAppSheet(urlRegistros);
    const sinProtocolo = todosLosRegistros.filter(row => !row.ID_Protocolo || row.ID_Protocolo.trim() === "");
    const isometricosUnicos = [...new Set(sinProtocolo.map(row => row.ID_Isometrico))];
    console.log('Isométricos disponibles:', isometricosUnicos);

    // Cargar protocolos
    todosLosProtocolos = await fetchAppSheet(urlProtocolos);
    llenarSelectProtocolos(todosLosProtocolos);

    // 🔹 Actualizar contador de uniones protocolizadas
    actualizarContadorUniones();
  }

  // 🔹 Función para actualizar el contador de uniones protocolizadas
  function actualizarContadorUniones() {
    const unionesProtocolizadas = todosLosRegistros.filter(registro => 
      registro.ID_Protocolo && registro.ID_Protocolo.trim() !== ""
    );

    const contadorElement = document.getElementById("contadorUniones");
    if (contadorElement) {
      animarContador(contadorElement, unionesProtocolizadas.length);
    }
  }

  // 🔹 Función para animar el contador
  function animarContador(elemento, valorFinal) {
    const duracion = 1000;
    const inicio = performance.now();

    function actualizarNumero(tiempoActual) {
      const progreso = Math.min((tiempoActual - inicio) / duracion, 1);
      const valorActual = Math.floor(progreso * valorFinal);
      elemento.textContent = valorActual;
      
      if (progreso < 1) {
        requestAnimationFrame(actualizarNumero);
      } else {
        elemento.textContent = valorFinal;
      }
    }
    requestAnimationFrame(actualizarNumero);
  }

  // ==================== FUNCIONES YA FUNCIONALES ====================

  // Llenar select de protocolos (modo visualización)
  function llenarSelectProtocolos(protocolos) {
    const selectProtocolo = document.getElementById("protocoloSelect");
    if (selectProtocolo) {
      selectProtocolo.innerHTML = '<option value="">-- Selecciona un Protocolo Existente --</option>';
      
      protocolos.forEach(protocolo => {
        const option = document.createElement("option");
        option.value = protocolo.ID_Protocolo;
        option.textContent = `${protocolo.ID_Protocolo} - ${protocolo.ID_Isometrico || 'Sin isométrico'} (${protocolo.Estado_Protocolo || 'Sin estado'})`;
        selectProtocolo.appendChild(option);
      });

      // Event listener para cargar datos del protocolo seleccionado
      selectProtocolo.addEventListener("change", cargarDatosProtocolo);
    }
  }

  // Cargar datos del protocolo seleccionado
  async function cargarDatosProtocolo() {
    const selectProtocolo = document.getElementById("protocoloSelect");
    const protocoloId = selectProtocolo.value;
    
    if (!protocoloId) {
      limpiarFormulario();
      return;
    }

    // Encontrar el protocolo
    const protocolo = todosLosProtocolos.find(p => p.ID_Protocolo === protocoloId);
    if (!protocolo) return;

    // Llenar campos del protocolo
    llenarCamposProtocolo(protocolo);

    // Cargar registros asociados basándose en Uniones_En_Protocolo
    cargarUnionesProtocolo(protocolo);
  }

  // Nueva función para cargar uniones basándose en Uniones_En_Protocolo
  async function cargarUnionesProtocolo(protocolo) {
    if (!protocolo.Uniones_En_Protocolo) return;

    // Convertir EnumList a array
    let unionesIds = [];
    if (typeof protocolo.Uniones_En_Protocolo === 'string') {
      // Si viene como string separado por comas
      unionesIds = protocolo.Uniones_En_Protocolo.split(',').map(id => id.trim());
    } else if (Array.isArray(protocolo.Uniones_En_Protocolo)) {
      unionesIds = protocolo.Uniones_En_Protocolo;
    } else {
      // Si es un solo valor
      unionesIds = [protocolo.Uniones_En_Protocolo];
    }

    // Filtrar solo los primeros 7
    unionesIds = unionesIds.slice(0, 7);

    // Buscar los registros correspondientes
    const registrosUniones = unionesIds.map(idRegistro => {
      return todosLosRegistros.find(r => r.ID_Registro === idRegistro);
    }).filter(Boolean); // Remover undefined

    // Llenar los campos con estos registros
    llenarCamposRegistrosEspecifico(registrosUniones, protocolo.Torque_100_Objetivo);
  }

  // Llenar campos del protocolo
  function llenarCamposProtocolo(protocolo) {
    const campos = {
      'subsistema': protocolo.Sub_Sistema,
      'isometrico': protocolo.ID_Isometrico,
      'hoja': protocolo.Hoja_Referencia,
      'area': protocolo.Area_Linea,
      'torque': protocolo.Torque_100_Objetivo,
      'herramienta': protocolo.Nombre_Herramienta,
      'serie': protocolo.Serie_Herramienta,
      'flangeMaterial': protocolo.Flange_Material,
      'diametroRating': protocolo.DiametroRating_Protocolo,
      'gasketType': protocolo.Gasket_Type,
      'gasketMaterial': protocolo.Gasket_Material,
      'boltMaterial': protocolo.Bolt_Material,
      'boltSize': protocolo.Bolt_Size,
      'boltQty': protocolo.Bolt_Qty_Total,
      'lubricantName': protocolo.Lubricant_Name,
      'washerDesc': protocolo.Washer_Desc
    };

    // Llenar campos de texto
    Object.keys(campos).forEach(campoId => {
      const campo = document.getElementById(campoId);
      if (campo && campos[campoId]) {
        campo.value = campos[campoId];
      }
    });

    // Sincronizar gasketSize con diametroRating
    const gasketSize = document.getElementById("gasketSize");
    if (gasketSize && protocolo.DiametroRating_Protocolo) {
      gasketSize.value = protocolo.DiametroRating_Protocolo;
    }
  }

  // Nueva función específica para llenar registros con cálculos
  function llenarCamposRegistrosEspecifico(registros, torqueObjetivo) {
    // Limpiar todos los campos primero
    for (let i = 1; i <= 7; i++) {
      limpiarFilaUnion(i);
    }

    // Llenar con los registros específicos
    registros.forEach((registro, index) => {
      if (index < 7) {
        const fila = index + 1;
        llenarFilaUnionEspecifica(fila, registro, torqueObjetivo);
      }
    });
  }

  // Nueva función para llenar una fila con cálculos específicos
  function llenarFilaUnionEspecifica(fila, registro, torqueObjetivo) {
    // 1. Extraer últimos 4 caracteres del ID_Union_Maestra para flangeJoint
    const flangeJointCampo = document.getElementById(`flangeJoint${fila}`);
    if (flangeJointCampo && registro.ID_Union_Maestra) {
      const ultimos4 = registro.ID_Union_Maestra.slice(-4);
      flangeJointCampo.value = ultimos4;
      
      // ACTIVAR TODOS LOS CHECKBOXES automáticamente cuando se llena desde Google Sheets
      activarCheckboxesFila(fila);
    }

    // 2. Calcular porcentajes del torque objetivo
if (torqueObjetivo) {
  const torque100 = parseFloat(torqueObjetivo);
  const torque30 = Math.round(torque100 * 0.3);
  const torque70 = Math.round(torque100 * 0.7);

  // Llenar campos de torque calculados
  const campo30 = document.getElementById(`flangeJoint${fila}_30`);
  const campo70 = document.getElementById(`flangeJoint${fila}_70`);
  const campo100 = document.getElementById(`flangeJoint${fila}_100`);

  if (campo30) campo30.value = (torque30 < 30) ? "Manual" : torque30;
  if (campo70) campo70.value = (torque70 < 30) ? "Manual" : torque70;
  if (campo100) campo100.value = (torque100 < 30) ? "Manual" : torque100;
}

    // 3. Llenar conteo de hilos expuestos
    const threadsCampo = document.getElementById(`threads_${fila}`);
    if (threadsCampo && registro.Conteo_Hilos_Expuestos !== undefined) {
      threadsCampo.value = registro.Conteo_Hilos_Expuestos;
    }

    // 4. Llenar checkboxes si existen datos (mantener los datos originales si vienen)
    const checkboxes = {
      [`torque30_${fila}`]: registro.Torque_30_Done,
      [`torque70_${fila}`]: registro.Torque_70_Done,
      [`torque100_${fila}`]: registro.Torque_100_Done,
      [`gap1_${fila}`]: registro.Gap_Check_1,
      [`gap2_${fila}`]: registro.Gap_Check_2,
      [`gapFinal_${fila}`]: registro.Gap_Check_Final
    };

    Object.keys(checkboxes).forEach(checkId => {
      const check = document.getElementById(checkId);
      if (check) {
        const valor = checkboxes[checkId];
        check.checked = valor === true || valor === "TRUE" || valor === "true" || valor === 1;
      }
    });
  }

  // Nueva función auxiliar para activar todos los checkboxes de una fila
  function activarCheckboxesFila(fila) {
    const checkboxIds = [
      `torque30_${fila}`, `torque70_${fila}`, `torque100_${fila}`,
      `gap1_${fila}`, `gap2_${fila}`, `gapFinal_${fila}`
    ];
    
    checkboxIds.forEach(checkId => {
      const check = document.getElementById(checkId);
      if (check) {
        check.checked = true;
      }
    });
  }

  // Limpiar una fila específica
  function limpiarFilaUnion(fila) {
    const elementos = [
      `flangeJoint${fila}`, `flangeJoint${fila}_30`, `flangeJoint${fila}_70`, 
      `flangeJoint${fila}_100`, `threads_${fila}`, `torque30_${fila}`, 
      `torque70_${fila}`, `torque100_${fila}`, `gap1_${fila}`, 
      `gap2_${fila}`, `gapFinal_${fila}`
    ];

    elementos.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        if (elemento.type === 'checkbox') {
          elemento.checked = false;
        } else {
          elemento.value = '';
        }
      }
    });
  }

  // Limpiar todo el formulario
  function limpiarFormulario() {
    // Limpiar campos principales
    const camposPrincipales = [
      'subsistema', 'isometrico', 'hoja', 'area', 'torque', 'herramienta', 'serie',
      'flangeMaterial', 'diametroRating', 'gasketType', 'gasketMaterial', 'gasketSize',
      'boltMaterial', 'boltSize', 'boltQty', 'lubricantName', 'washerDesc'
    ];

    camposPrincipales.forEach(id => {
      const campo = document.getElementById(id);
      if (campo) campo.value = '';
    });

    // Limpiar select de protocolo
    const protocoloSelect = document.getElementById("protocoloSelect");
    if (protocoloSelect) protocoloSelect.selectedIndex = 0;

    // Limpiar todas las filas de uniones
    for (let i = 1; i <= 7; i++) {
      limpiarFilaUnion(i);
    }
  }

  // Función de impresión optimizada para formato carta
  function imprimirFormulario() {
    // Ocultar sidebar temporalmente
    const sidebar = document.querySelector('.sidebar');
    const originalDisplay = sidebar.style.display;
    sidebar.style.display = 'none';

    // Configurar estilos de impresión específicos
    const formulario = document.querySelector('.formulario');
    const mainContent = document.querySelector('.main-content');
    
    if (formulario && mainContent) {
      // Asegurar que el formulario se imprima correctamente
      formulario.style.pageBreakInside = 'avoid';
      formulario.style.transform = 'none';
      mainContent.style.padding = '0';
      mainContent.style.justifyContent = 'center';
      mainContent.style.alignItems = 'center';
      
      // Ajustar tamaño de fuente para impresión si es necesario
      const campos = document.querySelectorAll('.campo');
      campos.forEach(campo => {
        if (campo.classList.contains('small-text')) {
          campo.style.fontSize = '8px';
        } else if (campo.classList.contains('medium-text')) {
          campo.style.fontSize = '9px';
        } else if (campo.classList.contains('large-text')) {
          campo.style.fontSize = '11px';
        }
      });
    }
    
    // Imprimir
    window.print();

    // Restaurar estilos después de imprimir
    setTimeout(() => {
      sidebar.style.display = originalDisplay;
      if (formulario) {
        formulario.style.transform = '';
      }
      if (mainContent) {
        mainContent.style.padding = '';
      }
      // Restaurar tamaños de fuente
      const campos = document.querySelectorAll('.campo');
      campos.forEach(campo => {
        campo.style.fontSize = '';
      });
    }, 1000);
  }

// FUNCIÓN PDF CORREGIDA - CON MEJOR AJUSTE DE TEXTO
async function generarPDF() {
  try {
    const formulario = document.querySelector('.formulario');
    if (!formulario) {
      alert('No se encontró el formulario para generar PDF');
      return;
    }

    console.log('Iniciando generación de PDF...');
    
    // Función auxiliar para calcular el tamaño óptimo del texto
    function calcularTamanoOptimo(campo) {
      if (campo.type === 'checkbox') return null;
      
      const rect = campo.getBoundingClientRect();
      const text = campo.value ? campo.value.toString().trim() : '';
      
      if (!text) return 7; // Tamaño mínimo para campos vacíos
      
      // Crear elemento temporal para medir texto
      const temp = document.createElement('span');
      temp.style.visibility = 'hidden';
      temp.style.position = 'absolute';
      temp.style.whiteSpace = 'nowrap';
      temp.style.fontFamily = 'Arial, sans-serif';
      temp.style.fontWeight = '600';
      temp.textContent = text;
      document.body.appendChild(temp);
      
      let fontSize = 12;
      let fits = false;
      
      // Reducir tamaño hasta que quepa
      while (fontSize >= 5 && !fits) {
        temp.style.fontSize = fontSize + 'px';
        const tempWidth = temp.getBoundingClientRect().width;
        
        // Dejar margen de 4px a cada lado
        if (tempWidth <= (rect.width - 8)) {
          fits = true;
        } else {
          fontSize--;
        }
      }
      
      document.body.removeChild(temp);
      return Math.max(5, fontSize); // Mínimo 5px
    }
    
    // Preparar el formulario para captura óptima
    const sidebar = document.querySelector('.sidebar');
    const originalSidebarDisplay = sidebar.style.display;
    sidebar.style.display = 'none';

    // Guardar estilos originales del formulario
    const originalFormularioStyle = {
      transform: formulario.style.transform,
      width: formulario.style.width,
      height: formulario.style.height,
      maxWidth: formulario.style.maxWidth,
      maxHeight: formulario.style.maxHeight
    };

    // Ajustar el formulario para captura perfecta (dimensiones exactas)
    formulario.style.transform = 'none';
    formulario.style.width = '816px';  // 8.5 pulgadas a 96 DPI
    formulario.style.height = '1056px'; // 11 pulgadas a 96 DPI
    formulario.style.maxWidth = '816px';
    formulario.style.maxHeight = '1056px';

    // Ajustar texto para PDF con medición real
    const campos = document.querySelectorAll('.campo');
    const originalStyles = [];
    
    campos.forEach((campo, index) => {
      // Guardar estilos originales
      originalStyles[index] = {
        fontSize: campo.style.fontSize,
        fontWeight: campo.style.fontWeight,
        lineHeight: campo.style.lineHeight,
        color: campo.style.color,
        textAlign: campo.style.textAlign,
        overflow: campo.style.overflow,
        whiteSpace: campo.style.whiteSpace,
        textOverflow: campo.style.textOverflow
      };
      
      // Solo ajustar campos de texto (no checkboxes)
      if (campo.type === 'checkbox') {
        return;
      }
      
      // Calcular tamaño óptimo basado en medición real
      const optimalSize = calcularTamanoOptimo(campo);
      
      if (optimalSize) {
        // Aplicar estilos optimizados
        campo.style.fontSize = `${optimalSize}px`;
        campo.style.fontWeight = '600';
        campo.style.lineHeight = '1.1';
        campo.style.color = '#000000';
        campo.style.textAlign = 'center';
        campo.style.overflow = 'hidden';
        campo.style.whiteSpace = 'nowrap';
        campo.style.textOverflow = 'ellipsis';
        campo.style.padding = '1px';
        
        // Log para debug
        if (campo.value && campo.value.trim()) {
          console.log(`Campo: "${campo.value}" -> ${optimalSize}px`);
        }
      }
    });

    // Esperar un momento para que se apliquen los estilos
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Capturando formulario...');
    
    // Configurar html2canvas con parámetros optimizados
    const canvas = await html2canvas(formulario, {
      scale: 2, // Buena calidad sin problemas de memoria
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 816,
      height: 1056,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      removeContainer: true,
      imageTimeout: 15000,
      onclone: function(clonedDoc) {
        const clonedFormulario = clonedDoc.querySelector('.formulario');
        if (clonedFormulario) {
          clonedFormulario.style.transform = 'none';
          clonedFormulario.style.width = '816px';
          clonedFormulario.style.height = '1056px';
          clonedFormulario.style.maxWidth = '816px';
          clonedFormulario.style.maxHeight = '1056px';
          clonedFormulario.style.overflow = 'visible';
        }
        
        const clonedCampos = clonedDoc.querySelectorAll('.campo');
        clonedCampos.forEach(campo => {
          // Solo aplicar estilos a campos de texto, no checkboxes
          if (campo.type !== 'checkbox') {
            campo.style.color = '#000000';
            campo.style.backgroundColor = 'transparent';
            campo.style.border = 'none';
            campo.style.textAlign = 'center';
            campo.style.overflow = 'hidden';
            campo.style.whiteSpace = 'nowrap';
            campo.style.textOverflow = 'ellipsis';
            campo.style.padding = '0px';
            campo.style.lineHeight = '1.1';
          } else {
            // Para checkboxes, mantener estilos básicos
            campo.style.backgroundColor = 'transparent';
            campo.style.border = 'none';
          }
        });
      }
    });

    console.log(`Canvas generado: ${canvas.width}x${canvas.height}`);

    // Crear PDF con dimensiones exactas de carta
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true
    });

    // Dimensiones en mm (carta: 215.9 x 279.4 mm)
    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 6; // Margen de 6mm
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Mantener la relación de aspecto del formulario original (8.5:11)
    const targetRatio = 8.5 / 11;
    const availableRatio = contentWidth / contentHeight;
    
    let finalWidth, finalHeight;
    
    if (availableRatio > targetRatio) {
      // Hay más ancho disponible, ajustar por altura
      finalHeight = contentHeight;
      finalWidth = finalHeight * targetRatio;
    } else {
      // Hay más altura disponible, ajustar por ancho
      finalWidth = contentWidth;
      finalHeight = finalWidth / targetRatio;
    }

    // Centrar la imagen
    const xOffset = margin + (contentWidth - finalWidth) / 2;
    const yOffset = margin + (contentHeight - finalHeight) / 2;

    // Convertir canvas a imagen
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    console.log(`Añadiendo imagen al PDF: ${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}mm en posición (${xOffset.toFixed(1)}, ${yOffset.toFixed(1)})`);
    
    // Agregar imagen al PDF
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
    
    // Generar nombre del archivo
    const protocoloSelect = document.getElementById("protocoloSelect");
    const protocoloId = protocoloSelect.value || 'QCF-1316';
    const fecha = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `${protocoloId}_${fecha}.pdf`;
    
    // Descargar PDF
    pdf.save(nombreArchivo);
    console.log('PDF generado y descargado exitosamente');

    // Restaurar estilos originales del formulario
    formulario.style.transform = originalFormularioStyle.transform || '';
    formulario.style.width = originalFormularioStyle.width || '';
    formulario.style.height = originalFormularioStyle.height || '';
    formulario.style.maxWidth = originalFormularioStyle.maxWidth || '';
    formulario.style.maxHeight = originalFormularioStyle.maxHeight || '';

    // Restaurar sidebar
    sidebar.style.display = originalSidebarDisplay;

    // Restaurar estilos de campos
    campos.forEach((campo, index) => {
      if (originalStyles[index]) {
        campo.style.fontSize = originalStyles[index].fontSize || '';
        campo.style.fontWeight = originalStyles[index].fontWeight || '';
        campo.style.lineHeight = originalStyles[index].lineHeight || '';
        campo.style.color = originalStyles[index].color || '';
        campo.style.textAlign = originalStyles[index].textAlign || '';
        campo.style.overflow = originalStyles[index].overflow || '';
        campo.style.whiteSpace = originalStyles[index].whiteSpace || '';
        campo.style.textOverflow = originalStyles[index].textOverflow || '';
      }
    });
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error generando PDF: ' + error.message + '\nUsando impresión estándar como alternativa...');
    imprimirFormulario();
  }
}

  // Configurar modo de edición
  function configurarModo() {
    const modoSelect = document.getElementById("modoSelect");
    const modo = modoSelect.value;
    const campos = document.querySelectorAll('.campo');
    
    campos.forEach(campo => {
      if (modo === 'ver') {
        campo.setAttribute('readonly', true);
        if (campo.type === 'checkbox') {
          campo.disabled = true;
        }
      } else {
        campo.removeAttribute('readonly');
        if (campo.type === 'checkbox') {
          campo.disabled = false;
        }
      }
    });
  }

  // Sincronizar gasketSize con diametroRating
  function sincronizarGasketSize() {
    const diametroRating = document.getElementById("diametroRating");
    const gasketSize = document.getElementById("gasketSize");
    
    if (diametroRating && gasketSize) {
      diametroRating.addEventListener("input", () => {
        gasketSize.value = diametroRating.value;
      });
    }
  }

  // Event listener para el modo
  const modoSelect = document.getElementById("modoSelect");
  if (modoSelect) {
    modoSelect.addEventListener("change", configurarModo);
    configurarModo(); // Configurar modo inicial
  }

  // Configurar sincronización de gasketSize
  sincronizarGasketSize();

  // Configurar eventos de torque y gap
  const rango = [1, 2, 3, 4, 5, 6, 7];
  rango.forEach(num => {
    // Campos de torque
    const campo30 = document.getElementById(`flangeJoint${num}_30`);
    const campo70 = document.getElementById(`flangeJoint${num}_70`);
    const campo100 = document.getElementById(`flangeJoint${num}_100`);

    // Checkboxes de torque
    const check30 = document.getElementById(`torque30_${num}`);
    const check70 = document.getElementById(`torque70_${num}`);
    const check100 = document.getElementById(`torque100_${num}`);

    // Campo principal
    const campoPrincipal = document.getElementById(`flangeJoint${num}`);

    // Checkboxes de gap
    const gap1 = document.getElementById(`gap1_${num}`);
    const gap2 = document.getElementById(`gap2_${num}`);
    const gapFinal = document.getElementById(`gapFinal_${num}`);

    // Activación por torque
    if (campo30 && check30) {
      campo30.addEventListener("input", () => {
        check30.checked = campo30.value.trim() !== "";
      });
    }

    if (campo70 && check70) {
      campo70.addEventListener("input", () => {
        check70.checked = campo70.value.trim() !== "";
      });
    }

    if (campo100 && check100) {
      campo100.addEventListener("input", () => {
        check100.checked = campo100.value.trim() !== "";
      });
    }

    // Activación automática de TODOS los checkboxes cuando flangeJoint tiene valor
    if (campoPrincipal) {
      campoPrincipal.addEventListener("input", () => {
        const tieneValor = campoPrincipal.value.trim() !== "";
        
        // Array con todos los checkboxes de la fila
        const todosLosChecks = [check30, check70, check100, gap1, gap2, gapFinal];
        
        if (tieneValor) {
          // Marcar todos los checkboxes si hay valor en flangeJoint
          todosLosChecks.forEach(check => {
            if (check) check.checked = true;
          });
        } else {
          // Desmarcar todos los checkboxes si se borra el valor de flangeJoint
          todosLosChecks.forEach(check => {
            if (check) check.checked = false;
          });
        }
      });
    }
  });

  // Exponer funciones globalmente para uso en HTML
  window.imprimirFormulario = imprimirFormulario;
  window.generarPDF = generarPDF;
  window.limpiarFormulario = limpiarFormulario;

  // Inicializar aplicación
  cargarDatosIniciales();
});