const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";

const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const message = document.getElementById("message");
const result = document.getElementById("result");

function showMessage(text) {
  result.hidden = true;
  message.textContent = text;
  message.hidden = false;
}

// The lookup gives "2026-11-15 14:30"; show it like "Saturday 15 Nov, 14:30".
function formatLocalTime(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})$/.exec(text);
  if (!match) return text;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return day + ", " + match[4].padStart(2, "0") + ":" + match[5];
}

function showWeather(weather) {
  document.getElementById("city").textContent = weather.city + ", " + weather.country;
  document.getElementById("time").textContent = formatLocalTime(weather.localTime);
  document.getElementById("temp").textContent = Math.round(weather.temperatureC) + "°C";
  document.getElementById("desc").textContent = weather.description;
  document.getElementById("feels").textContent = Math.round(weather.feelsLikeC) + "°C";
  document.getElementById("humidity").textContent = weather.humidity + "%";
  document.getElementById("wind").textContent =
    Math.round(weather.windKph) + " km/h " + weather.windDirection;

  const icon = document.getElementById("icon");
  icon.alt = weather.description;
  if (typeof weather.icon === "string" && weather.icon.startsWith("https://")) {
    icon.src = weather.icon;
  } else {
    icon.removeAttribute("src");
  }

  message.hidden = true;
  result.hidden = false;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    const response = await fetch("/api/weather?city=" + encodeURIComponent(input.value));
    const data = await response.json();
    if (response.ok) {
      showWeather(data);
    } else {
      showMessage(data.error || UNAVAILABLE_MESSAGE);
    }
  } catch (error) {
    showMessage(UNAVAILABLE_MESSAGE);
  }
});
