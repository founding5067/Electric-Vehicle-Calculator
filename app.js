/* ============================================================
   VoltCalc — calculations
   All formulas shared by the gas-vs-EV and charge calculators.
   ============================================================ */

const $ = (id) => document.getElementById(id);

const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = (n) => {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 }) + "+";
  if (n >= 100) return n.toFixed(0);
  return n.toFixed(2);
};
// input.value is ALWAYS a string; parse it, else fall back.
const num = (v, fallback = 0) => {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : fallback;
};
const fmtTime = (hours) => {
  const h = Math.max(0, hours);
  const totalMin = h * 60;
  const hoursPart = Math.floor(totalMin / 60);
  const minsPart = Math.round(totalMin) % 60;
  if (hoursPart === 0) return `${minsPart} min`;
  if (minsPart === 0) return `${hoursPart} hr`;
  return `${hoursPart} hr ${minsPart} min`;
};

/* ---------- Section 1: Gas vs EV (like-for-like) ---------- */
function updateCompare() {
  const distance = num(document.getElementById("compare-distance").value);
  const mpg = num(document.getElementById("compare-mpg").value, 1);
  const gasPrice = num(document.getElementById("compare-gas-price").value);
  const eff = num(document.getElementById("compare-eff").value, 1);
  const elecPrice = num(document.getElementById("compare-elec-price").value);
  const gridCo2 = num(document.getElementById("compare-grid-co2").value);

  // Gas figures
  const gallons = distance / mpg;
  const gasCost = gallons * gasPrice;
  const gasCo2 = gallons * 8.9; // ~8.9 kg CO2 per gallon gasoline

  // EV figures
  const evKwh = distance / eff;
  const evCost = evKwh * elecPrice;
  const evCo2 = evKwh * gridCo2;

  // Compare
  const costDiff = gasCost - evCost;
  const pct = gasCost ? (costDiff / gasCost) * 100 : 0;
  const co2Diff = gasCo2 - evCo2;
  const co2Pct = gasCo2 ? (co2Diff / gasCo2) * 100 : 0;

  // Populate
  $("res-dist").textContent = Math.round(distance);
  $("res-dist2").textContent = Math.round(distance);
  $("res-gas-cost").textContent = moneyShort(gasCost);
  $("res-ev-cost").textContent = moneyShort(evCost);
  $("res-gas-detail").textContent = `${gallons.toFixed(1)} gal`;
  $("res-ev-detail").textContent = `${evKwh.toFixed(1)} kWh`;
  $("res-gas-co2").textContent = Math.round(gasCo2);
  $("res-ev-co2").textContent = Math.round(evCo2);
  $("res-gas-co2-detail").textContent = `${(gasCo2 / 1000).toFixed(1)} t`;
  $("res-ev-co2-detail").textContent = `${(evCo2 / 1000).toFixed(2)} t`;

  // Saving banner
  $("saving-amount").textContent = "$" + moneyShort(costDiff);
  $("saving-pct").textContent = pct.toFixed(0) + "%";
  $("saving-co2").textContent =
    co2Diff > 0
      ? `−${Math.round(co2Diff)} kg CO₂ (${co2Pct.toFixed(0)}% fewer emissions)`
      : "EV costs more this trip — check your electricity rate";

  const headline = costDiff >= 0
    ? "Going electric saves you"
    : "At these rates, gas is cheaper this trip";
  $("saving-headline").textContent = headline;
}

/* ---------- Section 2: Charge time & cost ---------- */
function updateCharge() {
  const cap = num(document.getElementById("cap").value);
  const from = num(document.getElementById("from").value, 0);
  const to = num(document.getElementById("to").value, 100);
  const power = num(document.getElementById("power").value);
  const elecPrice = num(document.getElementById("elec").value);

  // Clamp targets to [0, 100]
  const fromClamp = Math.max(0, Math.min(100, from));
  const toClamp = Math.max(0, Math.min(100, to));

  // Energy needed = capacity * (goal% - current%) / 100
  const energyKwh = (cap * (toClamp - fromClamp)) / 100;
  const deltaPct = toClamp - fromClamp;

  $("out-energy").textContent = energyKwh > 0 ? energyKwh.toFixed(1) + " kWh" : "0 kWh";
  $("out-energy").classList.toggle("placeholder", energyKwh <= 0);
  $("charge-sub").textContent = `from ${Math.round(fromClamp)}% → ${Math.round(toClamp)}%`;
  $("charge-price-note").textContent = elecPrice.toFixed(2);

  // Charge time = energy / power  (hours)
  const timeHours = power > 0 ? energyKwh / power : Infinity;

  // Cost = energy * price
  const cost = energyKwh * elecPrice;

  // Text
  $("res-time").textContent = fmtTime(timeHours);
  $("res-time-detail").textContent = `${energyKwh.toFixed(1)} kWh ÷ ${power} kW`;
  $("res-cost").textContent = moneyShort(cost);
  $("res-cost-detail").textContent = `${energyKwh.toFixed(1)} kWh × $${elecPrice.toFixed(2)}`;

  // Charge bar visuals (fill = current level, dashed range = the delta)
  const full = Math.max(fromClamp, toClamp);
  const fillPct = Math.min(100, full);
  const startPct = (fromClamp / 100) * 100;
  const endPct = (toClamp / 100) * 100;

  $("charge-fill").style.width = fillPct + "%";
  $("mark-from").style.left = startPct + "%";
  $("mark-to").style.left = endPct + "%";
  const rangeWidth = Math.max(2, endPct - startPct);
  $("bar-range").style.left = startPct + "%";
  $("bar-range").style.width = rangeWidth + "%";
}

/* ---------- Wire up inputs ---------- */
function bind() {
  ["compare-distance", "compare-mpg", "compare-gas-price", "compare-eff",
   "compare-elec-price", "compare-grid-co2"]
    .forEach((id) => document.getElementById(id).addEventListener("input", updateCompare));

  ["cap", "from", "to", "power", "elec"]
    .forEach((id) => document.getElementById(id).addEventListener("input", updateCharge));
}

/* ---------- Init ---------- */
bind();
updateCompare();
updateCharge();
