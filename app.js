(() => {
  const $ = (id) => document.getElementById(id);
  const state = { battery: null, samples: [], marks: [] };
  const canvas = $("batteryChart");
  const ctx = canvas.getContext("2d");

  function tickClock() {
    const now = new Date();
    $("clock").textContent = now.toLocaleTimeString("es-AR", {hour12:false});
    $("dateLabel").textContent = now.toLocaleDateString("es-AR", {weekday:"short", day:"2-digit", month:"short", year:"numeric"});
  }
  tickClock(); setInterval(tickClock, 1000);

  function addLog(message) {
    const row = document.createElement("div");
    row.className = "log-entry";
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = new Date().toLocaleTimeString("es-AR", {hour12:false});
    const msg = document.createElement("span");
    msg.textContent = message;
    row.append(time, msg);
    $("eventLog").prepend(row);
    while ($("eventLog").children.length > 12) $("eventLog").lastElementChild.remove();
  }

  function addSample(level) {
    state.samples.push({time:Date.now(), level});
    if (state.samples.length > 60) state.samples.shift();
    $("sampleCount").textContent = `${state.samples.length} ${state.samples.length === 1 ? "muestra" : "muestras"}`;
    $("chartEmpty").style.display = state.samples.length ? "none" : "flex";
    drawChart();
  }

  function drawChart() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0,0,w,h);
    const left=30, right=8, top=10, bottom=24;
    const cw=w-left-right, ch=h-top-bottom;
    ctx.font = "10px system-ui";
    for (let v=0; v<=100; v+=25) {
      const y=top+ch-(v/100)*ch;
      ctx.strokeStyle="#273845"; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();
      ctx.fillStyle="#718491";ctx.textAlign="right";ctx.fillText(`${v}%`,left-8,y+3);
    }
    if (!state.samples.length) return;
    const points=state.samples.map((s,i)=>({
      x: state.samples.length===1 ? left+cw/2 : left+(i/(state.samples.length-1))*cw,
      y: top+ch-(s.level/100)*ch
    }));
    if (points.length>1) {
      ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
      points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.lineTo(points[points.length-1].x,top+ch);ctx.lineTo(points[0].x,top+ch);ctx.closePath();
      const gradient=ctx.createLinearGradient(0,top,0,top+ch);
      gradient.addColorStop(0,"rgba(99,215,189,.20)");gradient.addColorStop(1,"rgba(99,215,189,0)");
      ctx.fillStyle=gradient;ctx.fill();
      ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.strokeStyle="#63d7bd";ctx.lineWidth=2;ctx.stroke();
    }
    const last=points[points.length-1];
    ctx.beginPath();ctx.arc(last.x,last.y,3.5,0,Math.PI*2);ctx.fillStyle="#63d7bd";ctx.fill();
    ctx.fillStyle="#8da2ae";ctx.textAlign="left";ctx.fillText("INICIO",left,h-5);
    ctx.textAlign="right";ctx.fillText("AHORA",w-right,h-5);
  }

  function batteryUpdate() {
    if (!state.battery) return;
    const b=state.battery;
    const level=Math.round(b.level*100);
    $("batteryLevel").textContent=level;
    $("batteryBar").style.width=`${level}%`;
    $("batteryStatus").textContent=b.charging ? "Batería conectada a carga" : "Funcionando con batería";
    $("powerState").textContent=b.charging ? "CARGANDO" : "DESCARGA";
    $("powerTag").textContent=b.charging ? "ALIMENTACIÓN CONECTADA" : "SIN CARGA EXTERNA";
    $("powerTag").className="status-tag";
    $("capBattery").textContent="DISPONIBLE";
    $("liveState").textContent="LECTURA ACTIVA";
  }

  async function initBattery() {
    if (!("getBattery" in navigator)) {
      $("batteryLevel").textContent="—";
      $("batteryStatus").textContent="Este navegador no expone el nivel de batería.";
      $("powerState").textContent="NO DISPONIBLE";
      $("powerTag").textContent="API NO COMPATIBLE";
      $("powerTag").className="status-tag unavailable";
      $("capBattery").textContent="NO COMPATIBLE";
      $("liveState").textContent="MODO LIMITADO";
      addLog("Battery Status API no disponible; no se mostrarán valores inventados.");
      return;
    }
    try {
      state.battery = await navigator.getBattery();
      const update=()=> {
        batteryUpdate();
        addSample(Math.round(state.battery.level*100));
      };
      update();
      state.battery.addEventListener("levelchange", update);
      state.battery.addEventListener("chargingchange", () => { batteryUpdate(); addLog(state.battery.charging ? "El navegador detecta estado de carga." : "El navegador detecta funcionamiento con batería."); });
      addLog("Lectura de batería disponible en este navegador.");
      // Add a periodic sample to make a timeline while this page is open.
      setInterval(() => { if (state.battery) addSample(Math.round(state.battery.level*100)); }, 60000);
    } catch (e) {
      $("batteryStatus").textContent="El navegador bloqueó el acceso a la batería.";
      $("capBattery").textContent="BLOQUEADO";
      $("liveState").textContent="MODO LIMITADO";
      addLog("No se pudo acceder a los datos de batería.");
    }
  }

  function deviceInfo() {
    const cores = navigator.hardwareConcurrency;
    const memory = navigator.deviceMemory;
    const parts=[];
    if (cores) parts.push(`${cores} núcleos lógicos reportados`);
    if (memory) parts.push(`${memory} GB de memoria aprox.`);
    $("systemDetails").textContent = parts.length ? parts.join(" · ") : "El navegador limita la información del hardware.";
    addLog("Información básica del navegador recopilada.");
  }

  $("markButton").addEventListener("click", () => {
    const level=state.battery ? `${Math.round(state.battery.level*100)}% de batería` : "nivel de batería no disponible";
    addLog(`Marca manual: ${level}.`);
    if (state.battery) addSample(Math.round(state.battery.level*100));
  });
  $("clearButton").addEventListener("click", () => {
    state.samples=[]; $("sampleCount").textContent="0 muestras"; $("chartEmpty").style.display="flex"; drawChart();
    $("eventLog").replaceChildren();
    addLog("Historial de esta sesión reiniciado.");
  });
  window.addEventListener("resize", drawChart);
  deviceInfo();
  initBattery();
  drawChart();
})();