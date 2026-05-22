const $ = id => document.getElementById(id);
const sourceEl = $("source");
const classEl = $("pipeClass");
const npsEl = $("nps");
const manualServiceEl = $("manualService");
const manualMaterialEl = $("manualMaterial");
const manualScheduleEl = $("manualSchedule");
const densityEl = $("density");
const insulationEl = $("insulation");
const includeHydroEl = $("includeHydro");

function fmt(n, decimals=2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
}
function currentClass() {
  return PIM2_CLASSES[classEl.value];
}
function setupTabs() {
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  }));
}
function fillClasses() {
  classEl.innerHTML = Object.entries(PIM2_CLASSES).map(([code, c]) =>
    `<option value="${code}">${code} — ${c.service}</option>`).join("");
}
function setManualVisibility() {
  const manual = sourceEl.value === "manual";
  $("classField").classList.toggle("hidden", manual);
  document.querySelectorAll(".manual-only").forEach(el => el.classList.toggle("hidden", !manual));
  updateSelections();
}
function fillManualSchedules() {
  manualScheduleEl.innerHTML = Object.keys(WT_MM).map(s => `<option value="${s}">${s}</option>`).join("");
  manualScheduleEl.value = "SCH 40";
}
function updateSelections() {
  if (sourceEl.value === "pim2") {
    const c = currentClass();
    const sizes = sizesInRanges(c.ranges).filter(nps => SPAN_TABLE[nps] && WT_MM[scheduleFor(c.ranges,nps)]?.[nps]);
    npsEl.innerHTML = sizes.map(n => `<option value="${n}">${n} in</option>`).join("");
    if (c.density === null) densityEl.value = "";
    else densityEl.value = c.density;
    $("densityHint").textContent = c.densityNote;
  } else {
    const sched = manualScheduleEl.value || "SCH 40";
    const sizes = NPS_ORDER.filter(nps => SPAN_TABLE[nps] && WT_MM[sched]?.[nps]);
    npsEl.innerHTML = sizes.map(n => `<option value="${n}">${n} in</option>`).join("");
    if (!densityEl.value) densityEl.value = manualServiceEl.value === "liquid" ? WATER_DENSITY : 0;
    $("densityHint").textContent = "Editable operating content density.";
  }
  calculate();
}
function getSelectedPipe() {
  if (sourceEl.value === "pim2") {
    const c = currentClass();
    return {
      service:c.service, group:c.group, material:c.material, metal:c.metal,
      nps:npsEl.value, schedule:scheduleFor(c.ranges,npsEl.value)
    };
  }
  return {
    service:manualServiceEl.value === "liquid" ? "Manual Liquid Service" : "Manual Gas / Vapour / Steam Service",
    group:manualServiceEl.value,
    material:manualMaterialEl.value === "SS" ? "Stainless Steel" : "Carbon / Alloy Steel",
    metal:manualMaterialEl.value,
    nps:npsEl.value,
    schedule:manualScheduleEl.value
  };
}
function pipeProperties(pipe) {
  const od = OD_MM[pipe.nps];
  const wt = WT_MM[pipe.schedule]?.[pipe.nps];
  if (!od || !wt) return null;
  const id = od - (2 * wt);
  const areaMetal = Math.PI / 4 * (Math.pow(od/1000, 2) - Math.pow(id/1000, 2));
  const volumeInternal = Math.PI / 4 * Math.pow(id/1000, 2);
  const pipeKgM = areaMetal * METAL_DENSITY[pipe.metal];
  return {od, wt, id, pipeKgM, volumeInternal};
}
function reaction(massPerM, span) {
  const kgf = massPerM * span;
  const kN = kgf * G / 1000;
  return {kgf, kN};
}
function calculate() {
  const pipe = getSelectedPipe();
  const props = pipeProperties(pipe);
  if (!props) return;

  const hydroIncluded = includeHydroEl.checked;
  const spanKind = (hydroIncluded || pipe.group === "liquid") ? "water" : "vapor";
  const span = SPAN_TABLE[pipe.nps][spanKind];

  const insulation = Math.max(0, parseFloat(insulationEl.value) || 0);
  const densityRaw = densityEl.value.trim();
  const opDensity = densityRaw === "" ? null : Math.max(0, parseFloat(densityRaw));
  const fluidKgM = opDensity === null ? null : props.volumeInternal * opDensity;
  const waterKgM = props.volumeInternal * WATER_DENSITY;

  const emptyMass = props.pipeKgM + insulation;
  const operatingMass = fluidKgM === null ? null : emptyMass + fluidKgM;
  const hydroMass = hydroIncluded ? emptyMass + waterKgM : null;
  const cases = [
    {name:"Empty + insulation", mass:emptyMass},
    {name:"Operating", mass:operatingMass},
    {name:"Water-filled test", mass:hydroMass}
  ].filter(c => c.mass !== null);
  const governing = cases.reduce((a,b) => b.mass > a.mass ? b : a);
  const governReaction = reaction(governing.mass, span);

  $("outService").textContent = pipe.service;
  $("outMaterial").textContent = pipe.material;
  $("outSchedule").textContent = pipe.schedule;
  $("outDimensions").textContent = `OD ${fmt(props.od,1)} mm / ID ${fmt(props.id,1)} mm`;
  $("outCategory").textContent = spanKind === "water" ? "Water / liquid reference" : "Gas / vapour reference";

  $("spanValue").textContent = fmt(span,1);
  $("spanBasis").textContent = spanKind === "water"
    ? `Water/liquid steel pipe spacing basis${hydroIncluded ? " — conservative water-filled case included." : "."}`
    : "Gas/vapour steel pipe spacing basis — water-filled test case excluded.";

  $("governingBadge").textContent = `Governing: ${governing.name}`;
  $("governingBadge").classList.add("ready");
  $("intermediateKN").textContent = `${fmt(governReaction.kN)} kN`;
  $("intermediateKG").textContent = `${fmt(governReaction.kgf,0)} kgf`;
  $("endKN").textContent = `${fmt(governReaction.kN/2)} kN`;
  $("endKG").textContent = `${fmt(governReaction.kgf/2,0)} kgf`;

  renderCase("empty", emptyMass, span);
  renderCase("oper", operatingMass, span);
  renderCase("hydro", hydroMass, span);
  document.querySelector(".hydro-row").classList.toggle("hidden", !hydroIncluded);

  const densityWarning = opDensity === null ? " Operating load is not reported until a fluid density is entered." : "";
  const hydroText = hydroIncluded ? " Water-filled test load is included in the displayed governing vertical load." : " Water-filled test load is excluded by user selection.";
  $("resultNote").textContent = `For preliminary survey and support planning only.${densityWarning}${hydroText} Add separate checks for valves, branches, fittings, thermal movement, vibration, structural capacity and final design loads.`;
}
function renderCase(prefix, mass, span) {
  if (mass === null) {
    $(`${prefix}KgM`).textContent = "—";
    $(`${prefix}KNM`).textContent = "—";
    $(`${prefix}Int`).textContent = "—";
    return;
  }
  const r = reaction(mass, span);
  $(`${prefix}KgM`).textContent = fmt(mass,1);
  $(`${prefix}KNM`).textContent = fmt(mass*G/1000,3);
  $(`${prefix}Int`).textContent = `${fmt(r.kN)} kN`;
}
function renderBasis() {
  $("referenceTable").innerHTML = NPS_ORDER.filter(n => SPAN_TABLE[n]).map(n =>
    `<tr><td>${n} in</td><td>${fmt(SPAN_TABLE[n].water,1)} m</td><td>${fmt(SPAN_TABLE[n].vapor,1)} m</td></tr>`).join("");
  $("seedClasses").innerHTML = Object.entries(PIM2_CLASSES).map(([code,c]) =>
    `<div class="class-item"><strong>${code}</strong><span>${c.service}</span></div>`).join("");
}
function bind() {
  sourceEl.addEventListener("change", setManualVisibility);
  classEl.addEventListener("change", updateSelections);
  npsEl.addEventListener("change", calculate);
  manualServiceEl.addEventListener("change", () => {
    densityEl.value = manualServiceEl.value === "liquid" ? WATER_DENSITY : 0;
    calculate();
  });
  manualMaterialEl.addEventListener("change", calculate);
  manualScheduleEl.addEventListener("change", updateSelections);
  includeHydroEl.addEventListener("change", calculate);
  densityEl.addEventListener("input", calculate);
  insulationEl.addEventListener("input", calculate);
  $("calculateBtn").addEventListener("click", calculate);
}
function init() {
  setupTabs();
  fillClasses();
  fillManualSchedules();
  bind();
  renderBasis();
  classEl.value = "F1A2";
  setManualVisibility();
  npsEl.value = "6";
  calculate();
}
document.addEventListener("DOMContentLoaded", init);
