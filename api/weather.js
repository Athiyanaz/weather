const NOT_FOUND_MESSAGE = "We couldn't find that city. Please check the spelling and try again.";
const UNAVAILABLE_MESSAGE = "The weather service is unavailable right now. Please try again later.";

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  let city = req.query && req.query.city;
  if (Array.isArray(city)) city = city[0];
  city = typeof city === "string" ? city.trim() : "";

  if (!city) {
    return res.status(404).json({ error: NOT_FOUND_MESSAGE });
  }

  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
  }

  try {
    const url =
      "https://api.weatherapi.com/v1/current.json?key=" +
      encodeURIComponent(key) +
      "&q=" +
      encodeURIComponent(city);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const code = data && data.error && data.error.code;
      // 1003 = no city given, 1006 = no matching city found
      if (code === 1003 || code === 1006) {
        return res.status(404).json({ error: NOT_FOUND_MESSAGE });
      }
      return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
    }

    const { location, current } = data;
    let icon = current.condition.icon;
    if (typeof icon === "string" && icon.startsWith("//")) icon = "https:" + icon;

    return res.status(200).json({
      city: location.name,
      country: location.country,
      localTime: location.localtime,
      description: current.condition.text,
      icon: icon,
      temperatureC: current.temp_c,
      feelsLikeC: current.feelslike_c,
      humidity: current.humidity,
      windKph: current.wind_kph,
      windDirection: current.wind_dir,
    });
  } catch (error) {
    return res.status(503).json({ error: UNAVAILABLE_MESSAGE });
  }
};
