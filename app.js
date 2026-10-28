const LATITUDE = 13.5965;
const LONGITUDE = 123.1774;
const TIMEZONE = "Asia/Manila";

const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const loadButton = document.getElementById("loadButton");
const csvButton = document.getElementById("csvButton");
const messageBox = document.getElementById("message");
const statusText = document.getElementById("statusText");
let currentRows = [];
let charts = {};

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function initializeSelectors() {
  const now = new Date();
  const currentYear = now.getFullYear();
  for (let year = currentYear; year >= 1940; year--) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }
  // Start with the most recent fully completed calendar month.
  const previousMonth = new Date(currentYear, now.getMonth() - 1, 1);
  monthSelect.value = String(previousMonth.getMonth());
  yearSelect.value = String(previousMonth.getFullYear());
}

function showMessage(message, type = "info") {
  messageBox.textContent = message;
  messageBox.classList.remove("hidden", "error");
  if (type === "error") messageBox.classList.add("error");
}
function clearMessage() {
  messageBox.textContent = "";
  messageBox.classList.add("hidden");
}
function setStatus(text) { statusText.textContent = text; }

function dateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function average(values) {
  const valid = values.filter(v => Number.isFinite(v));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}
function sum(values) {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}
function formatNumber(value, decimals = 1) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "—";
}
function displayMetric(id, value, unit, decimals = 1) {
  document.getElementById(id).innerHTML = `${formatNumber(value, decimals)}<small>${unit}</small>`;
}
function dateLabel(isoDate, options = { month: "short", day: "numeric" }) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-PH", options);
}
function weatherDescription(code) {
  if (code === 0) return ["Clear", "☀️"];
  if ([1, 2].includes(code)) return ["Partly cloudy", "🌤️"];
  if (code === 3) return ["Overcast", "☁️"];
  if ([45, 48].includes(code)) return ["Fog", "🌫️"];
  if ([51, 53, 55, 56, 57].includes(code)) return ["Drizzle", "🌦️"];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ["Rain", "🌧️"];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ["Snow", "❄️"];
  if ([95, 96, 99].includes(code)) return ["Thunderstorm", "⛈️"];
  return ["Conditions unavailable", "🌡️"];
}

function makeChart(id, config) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext("2d");
  charts[id] = new Chart(ctx, config);
}
const commonOptions = {
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: true, labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, color: "#7d8b9b", font: { family: "DM Sans", size: 10 }, padding: 16 } },
    tooltip: { backgroundColor: "#10243a", padding: 11, titleFont: { family: "DM Sans" }, bodyFont: { family: "DM Sans" } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#8b98a7", maxTicksLimit: 10, font: { family: "DM Sans", size: 9 } }, border: { display: false } },
    y: { grid: { color: "#edf1f5" }, ticks: { color: "#8b98a7", font: { family: "DM Sans", size: 9 } }, border: { display: false } }
  }
};

function renderCharts(days) {
  const labels = days.map(d => dateLabel(d.date, { day: "numeric" }));
  makeChart("temperatureChart", {
    type: "line",
    data: { labels, datasets: [
      { label: "Minimum °C", data: days.map(d => d.minTemp), borderColor: "#6aa6e9", backgroundColor: "#6aa6e9", borderWidth: 2, pointRadius: 1.5, tension: .3 },
      { label: "Maximum °C", data: days.map(d => d.maxTemp), borderColor: "#f3a44b", backgroundColor: "#f3a44b", borderWidth: 2, pointRadius: 1.5, tension: .3 }
    ]},
    options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, title: { display: true, text: "Temperature (°C)", color: "#7d8b9b", font: { size: 10 } } } } }
  });
  makeChart("rainChart", {
    type: "bar",
    data: { labels, datasets: [{ label: "Precipitation (mm)", data: days.map(d => d.rain), backgroundColor: "#76b4ed", borderRadius: 4, maxBarThickness: 18 }] },
    options: { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } }, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, beginAtZero: true, title: { display: true, text: "Rainfall (mm)", color: "#7d8b9b", font: { size: 10 } } } } }
  });
  makeChart("humidityChart", {
    type: "line",
    data: { labels, datasets: [
      { label: "Humidity (%)", data: days.map(d => d.humidity), yAxisID: "y", borderColor: "#9a84e8", backgroundColor: "#9a84e8", borderWidth: 2, pointRadius: 1, tension: .3 },
      { label: "Max wind (km/h)", data: days.map(d => d.wind), yAxisID: "y1", borderColor: "#ee7866", backgroundColor: "#ee7866", borderWidth: 2, pointRadius: 1, tension: .3 }
    ]},
    options: { ...commonOptions, scales: {
      ...commonOptions.scales,
      y: { ...commonOptions.scales.y, min: 0, max: 100, title: { display: true, text: "Humidity (%)", color: "#7d8b9b", font: { size: 10 } } },
      y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: "#8b98a7", font: { family: "DM Sans", size: 9 } }, border: { display: false }, title: { display: true, text: "Wind (km/h)", color: "#7d8b9b", font: { size: 10 } } }
    } }
  });
}

function renderTable(days) {
  const tbody = document.getElementById("weatherRows");
  tbody.innerHTML = "";
  for (const day of days) {
    const [description, icon] = weatherDescription(day.code);
    const tr = document.createElement("tr");
    const values = [
      dateLabel(day.date, { weekday: "short", month: "short", day: "numeric" }),
      `${icon} ${description}`,
      `${formatNumber(day.minTemp)}° / ${formatNumber(day.maxTemp)}°`,
      `${formatNumber(day.rain)} mm`,
      `${formatNumber(day.humidity, 0)}%`,
      `${formatNumber(day.wind)} km/h`
    ];
    values.forEach((value, index) => {
      const td = document.createElement("td");
      if (index === 1) {
        td.className = "condition";
        const iconSpan = document.createElement("span");
        iconSpan.className = "condition-icon";
        iconSpan.textContent = icon;
        const descSpan = document.createElement("span");
        descSpan.textContent = description;
        td.append(iconSpan, descSpan);
      } else {
        td.textContent = value;
        if (index === 2) td.className = "temp-cell";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  document.getElementById("recordCount").textContent = `${days.length} daily records`;
  csvButton.disabled = days.length === 0;
}

function renderSummary(days) {
  const avgTemp = average(days.map(d => d.meanTemp));
  const maxDay = days.reduce((best, d) => d.maxTemp != null && (best === null || d.maxTemp > best.maxTemp) ? d : best, null);
  const totalRain = sum(days.map(d => d.rain));
  const avgHumidity = average(days.map(d => d.humidity));
  displayMetric("avgTemp", avgTemp, "°C");
  displayMetric("maxTemp", maxDay?.maxTemp ?? null, "°C");
  displayMetric("totalRain", totalRain, "mm");
  displayMetric("avgHumidity", avgHumidity, "%", 0);
  document.getElementById("maxTempDate").textContent = maxDay ? `On ${dateLabel(maxDay.date, { month: "short", day: "numeric" })}` : "No maximum temperature data";
  const rainyDays = days.filter(d => Number.isFinite(d.rain) && d.rain >= 1).length;
  document.getElementById("rainDays").textContent = `${rainyDays} days with at least 1 mm precipitation`;
}

async function loadMonth() {
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const now = new Date();
  const start = dateString(year, month, 1);
  const endDay = new Date(year, month + 1, 0).getDate();
  const end = dateString(year, month, endDay);
  const today = dateString(now.getFullYear(), now.getMonth(), now.getDate());

  if (start > today) {
    showMessage("That month is in the future. Select a past month to view historical records.", "error");
    setStatus("No data");
    return;
  }
  const requestedEnd = end > today ? today : end;
  const period = `${monthNames[month]} ${year}`;
  document.getElementById("periodTitle").textContent = period;
  document.getElementById("periodSubtitle").textContent = `Daily historical weather estimates for ${period}, Milaor, Camarines Sur.`;
  loadButton.disabled = true;
  loadButton.textContent = "Loading…";
  setStatus("Fetching");
  clearMessage();

  const params = new URLSearchParams({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    start_date: start,
    end_date: requestedEnd,
    daily: [
      "weather_code", "temperature_2m_mean", "temperature_2m_max", "temperature_2m_min",
      "precipitation_sum", "relative_humidity_2m_mean", "wind_speed_10m_max"
    ].join(","),
    timezone: TIMEZONE,
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm"
  });

  try {
    const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params.toString()}`);
    if (!response.ok) throw new Error(`Weather service returned HTTP ${response.status}.`);
    const data = await response.json();
    if (!data.daily || !Array.isArray(data.daily.time) || data.daily.time.length === 0) {
      throw new Error("No daily records were returned for this month.");
    }
    const daily = data.daily;
    const days = daily.time.map((date, i) => ({
      date,
      code: daily.weather_code?.[i] ?? null,
      meanTemp: daily.temperature_2m_mean?.[i] ?? null,
      maxTemp: daily.temperature_2m_max?.[i] ?? null,
      minTemp: daily.temperature_2m_min?.[i] ?? null,
      rain: daily.precipitation_sum?.[i] ?? null,
      humidity: daily.relative_humidity_2m_mean?.[i] ?? null,
      wind: daily.wind_speed_10m_max?.[i] ?? null
    }));
    currentRows = days;
    renderSummary(days);
    renderCharts(days);
    renderTable(days);
    setStatus("Data loaded");
    if (requestedEnd !== end) {
      showMessage("The selected month is still in progress. The dashboard shows data through today only. Recent historical values may be revised or delayed by the provider.");
    } else {
      showMessage("Historical records loaded. These are reanalysis estimates for the selected area, not direct readings from a weather station.");
    }
  } catch (error) {
    console.error(error);
    currentRows = [];
    document.getElementById("weatherRows").innerHTML = '<tr><td colspan="6" class="empty-cell">Could not load weather records. Please try again.</td></tr>';
    document.getElementById("recordCount").textContent = "No records loaded";
    csvButton.disabled = true;
    ["avgTemp", "maxTemp", "totalRain", "avgHumidity"].forEach(id => displayMetric(id, null, id === "totalRain" ? "mm" : id === "avgHumidity" ? "%" : "°C"));
    showMessage(`${error.message} Check your internet connection or try again later. Historical archives may have a short publication delay.`, "error");
    setStatus("Load failed");
  } finally {
    loadButton.disabled = false;
    loadButton.innerHTML = 'Load data <span aria-hidden="true">↗</span>';
  }
}

function exportCsv() {
  if (!currentRows.length) return;
  const headers = ["Date", "Weather code", "Mean temperature C", "Minimum temperature C", "Maximum temperature C", "Precipitation mm", "Mean relative humidity percent", "Maximum wind speed kmh"];
  const csvRows = [headers, ...currentRows.map(d => [d.date, d.code, d.meanTemp, d.minTemp, d.maxTemp, d.rain, d.humidity, d.wind])];
  const csv = csvRows.map(row => row.map(value => {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `milaor-weather-${yearSelect.value}-${String(Number(monthSelect.value) + 1).padStart(2, "0")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

loadButton.addEventListener("click", loadMonth);
csvButton.addEventListener("click", exportCsv);
monthSelect.addEventListener("change", loadMonth);
yearSelect.addEventListener("change", loadMonth);
initializeSelectors();
loadMonth();
