document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const addTextBtn = document.getElementById("addTextBtn");
    const linesContainer = document.getElementById("lines");
    const downloadBtn = document.getElementById("downloadBtn");
  
    let image = null;
    let texts = [];
  
    // === 1. SUBIR O PEGAR IMÁGENES ===
    fileInput.addEventListener("change", handleImageUpload);
    window.addEventListener("paste", handlePaste);
  
    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) loadImage(file);
    }
  
    function handlePaste(e) {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          loadImage(blob);
          break;
        }
      }
    }
  
    function loadImage(file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          image = img;
          canvas.width = img.width;
          canvas.height = img.height;
          drawCanvas();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    // === 2. DETECTAR LA LÍNEA EXISTENTE Y AÑADIR NUEVAS ===
    function initExistingLines() {
      const existing = linesContainer.querySelectorAll(".text-line");
      existing.forEach((div, index) => {
        const select = div.querySelector("select");
        const input = div.querySelector("input");
  
        const newText = {
          text: input.value || "",
          type: select.value || "talk",
          x: 20,
          y: 40 + index * 40,
          dragging: false,
        };
        texts.push(newText);
  
        input.addEventListener("input", (e) => {
          newText.text = e.target.value;
          drawCanvas();
        });
  
        select.addEventListener("change", (e) => {
          newText.type = e.target.value;
          drawCanvas();
        });
      });
    }
  
    initExistingLines();
  
    // === 3. AÑADIR NUEVAS LÍNEAS ===
    addTextBtn.addEventListener("click", () => {
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("text-line");
  
      const select = document.createElement("select");
      select.innerHTML = `
        <option value="talk">talk</option>
        <option value="me" style="color: purple;">/me</option>
        <option value="do" style="color: green;">/do</option>
      `;
  
      const input = document.createElement("input");
      input.type = "text";
  
      lineDiv.appendChild(select);
      lineDiv.appendChild(input);
      linesContainer.appendChild(lineDiv);
  
      const newText = {
        text: "",
        type: "talk",
        x: 20,
        y: 40 + texts.length * 20, // posición apilada
        dragging: false,
      };
      texts.push(newText);
  
      input.addEventListener("input", (e) => {
        newText.text = e.target.value;
        drawCanvas();
      });
  
      select.addEventListener("change", (e) => {
        newText.type = e.target.value;
        drawCanvas();
      });
  
      drawCanvas();
    });
  
    // === 4. DIBUJAR IMAGEN + TEXTOS ===
    function drawCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (image) ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
      texts.forEach((t) => {
        ctx.font = "16px Poppins";
        ctx.textBaseline = "top";
        ctx.fillStyle = getColorByType(t.type);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black"; 
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
      });
    }
  
    function getColorByType(type) {
      switch (type) {
        case "me":
          return "#A78CBC";
        case "do":
          return "#94C530";
        default:
          return "white";
      }
    }
  
    // === 5. MOVER TEXTOS CON RATÓN ===
    let draggingText = null;
    let offsetX, offsetY;
  
    canvas.addEventListener("mousedown", (e) => {
      const { offsetX: x, offsetY: y } = e;
      draggingText = getTextAtPosition(x, y);
      if (draggingText) {
        draggingText.dragging = true;
        offsetX = x - draggingText.x;
        offsetY = y - draggingText.y;
      }
    });
  
    canvas.addEventListener("mousemove", (e) => {
      if (!draggingText) return;
      const { offsetX: x, offsetY: y } = e;
      draggingText.x = x - offsetX;
      draggingText.y = y - offsetY;
      drawCanvas();
    });
  
    canvas.addEventListener("mouseup", () => {
      if (draggingText) draggingText.dragging = false;
      draggingText = null;
    });
  
    function getTextAtPosition(x, y) {
      for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        const width = ctx.measureText(t.text).width;
        const height = 32;
        if (x >= t.x && x <= t.x + width && y >= t.y && y <= t.y + height) {
          return t;
        }
      }
      return null;
    }
  
    // === 6. DESCARGAR IMAGEN FINAL ===
    downloadBtn.addEventListener("click", () => {
      if (!image) return alert("Primero sube una imagen");
      const link = document.createElement("a");
      link.download = "gta_rp_edit.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
  
  