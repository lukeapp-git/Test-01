// Aquí luego conectaremos con Google Sheets / AppSheet
console.log("Formulario QCF-1316 cargado");


  // Rango de joints que quieres controlar
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

    // Activación de gap checks desde campo principal
    if (campoPrincipal) {
      campoPrincipal.addEventListener("input", () => {
        const tieneValor = campoPrincipal.value.trim() !== "";
        [gap1, gap2, gapFinal].forEach(gap => {
          if (gap) gap.checked = tieneValor;
        });
      });
    }
  });


