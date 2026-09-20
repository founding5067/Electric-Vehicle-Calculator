# ⚡ VoltCalc — EV Cost & Charging Calculator

A sleek, eco-inspired calculator that helps people see the real price of going electric.

## What it does

1. **Gas vs EV (like-for-like)** — Compare cost and CO₂ emissions over the *same* trip distance.
2. **Charge time & cost** — Estimate how long a charge takes and how much it costs, based on:
   - battery capacity (kWh)
   - current charge → goal charge (%)
   - charger power (kW)
   - electricity price ($/kWh)

Everything updates live as you type.

## The math

Shared across both calculators:

```
energy_needed_kWh = battery_capacity × (goal% − current%) / 100
charge_time_h     = energy_needed_kWh / charger_power_kW
charge_cost$      = energy_needed_kWh × electricity_price_per_kWh
```

Gas vs EV (same distance `D`):

```
gallons  = D / mpg
gas_cost = gallons × gas_price
gas_co2  = gallons × 8.9            (≈ kg CO₂ per gallon)

ev_kwh   = D / miles_per_kwh
ev_cost  = ev_kwh × electricity_price
ev_co2   = ev_kwh × grid_co2_factor  (default 0.40 kg/kWh, US grid avg)
```

## Run it

No build step, no dependencies — just open the folder.

- **Fastest:** open `index.html` in your browser (double-click it).
- **Or serve it** (recommended, avoids any file:// quirks):

```bash
npx serve .
# then visit http://localhost:3000
```

## Host it free

It's static HTML/CSS/JS, so any static host works:

- **GitHub Pages** — push to a repo, enable Pages.
- **Netlify / Vercel** — drag the folder onto their drop zone.

## Files

| File         | Purpose                          |
|--------------|----------------------------------|
| `index.html` | Markup & layout                  |
| `styles.css` | Eco/sleek theme (glassmorphism)  |
| `app.js`     | Calculation logic                |

## Tweak the defaults

All starting values are plain `<input>` fields in `index.html` — change them to shift the demo baseline (e.g., your own car's efficiency, local gas/electricity prices).
