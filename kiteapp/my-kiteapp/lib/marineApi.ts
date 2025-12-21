// Open-Meteo Marine Weather API Service
export interface MarineData {
  latitude: number;
  longitude: number;
  wave_height: number;
  wave_direction: number;
  wave_period: number;
  wind_wave_height: number;
  wind_wave_direction: number;
  wind_wave_period: number;
  wind_speed: number;
  wind_direction: number;
  temperature: number;
}

export interface KiteSpot {
  id: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  beschreibung: string;
}

const MARINE_API_URL = 'https://marine-api.open-meteo.com/v1/marine';

export async function fetchMarineData(lat: number, lon: number): Promise<MarineData | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'wind_wave_height',
        'wind_wave_direction',
        'wind_wave_period'
      ].join(','),
      timezone: 'auto'
    });

    const response = await fetch(`${MARINE_API_URL}?${params}`);
    
    if (!response.ok) {
      console.warn(`Marine API error for ${lat},${lon}: ${response.status}`);
      // Rückgabe von Standardwerten bei Fehler
      return {
        latitude: lat,
        longitude: lon,
        wave_height: 1.0,
        wave_direction: 0,
        wave_period: 8,
        wind_wave_height: 0.8,
        wind_wave_direction: 0,
        wind_wave_period: 6,
        wind_speed: 0,
        wind_direction: 0,
        temperature: 0
      };
    }

    const data = await response.json();
    console.log('Marine API response for', lat, lon, ':', data.current);
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      wave_height: data.current?.wave_height || 1.0,
      wave_direction: data.current?.wave_direction || 0,
      wave_period: data.current?.wave_period || 8,
      wind_wave_height: data.current?.wind_wave_height || 0.8,
      wind_wave_direction: data.current?.wind_wave_direction || 0,
      wind_wave_period: data.current?.wind_wave_period || 6,
      wind_speed: 0,
      wind_direction: 0,
      temperature: 0
    };
  } catch (error) {
    console.error('Error fetching marine data:', error);
    // Rückgabe von Standardwerten bei Fehler
    return {
      latitude: lat,
      longitude: lon,
      wave_height: 1.0,
      wave_direction: 0,
      wave_period: 8,
      wind_wave_height: 0.8,
      wind_wave_direction: 0,
      wind_wave_period: 6,
      wind_speed: 0,
      wind_direction: 0,
      temperature: 0
    };
  }
}

// Open-Meteo Weather Forecast API für Wind und Temperatur
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherData(lat: number, lon: number) {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,wind_speed_10m,wind_direction_10m',
      timezone: 'auto'
    });

    const response = await fetch(`${WEATHER_API_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: data.current?.temperature_2m || 0,
      wind_speed: data.current?.wind_speed_10m || 0,
      wind_direction: data.current?.wind_direction_10m || 0
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Kombinierte Funktion für vollständige Spot-Daten
export async function fetchSpotData(spot: KiteSpot) {
  const [marineData, weatherData] = await Promise.all([
    fetchMarineData(spot.lat, spot.lng),
    fetchWeatherData(spot.lat, spot.lng)
  ]);

  // Bestimme Windrichtung als Text
  const getWindDirection = (degrees: number): string => {
    const directions = ['Nord', 'Nordost', 'Ost', 'Südost', 'Süd', 'Südwest', 'West', 'Nordwest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Bestimme Qualität basierend auf Wind und Wellen
  const getQuality = (windSpeed: number, waveHeight: number): string => {
    if (windSpeed >= 15 && windSpeed <= 30 && waveHeight < 2) return 'gut';
    if (windSpeed >= 10 && windSpeed < 40) return 'mittel';
    return 'schlecht';
  };

  // Verwende Standardwerte falls API-Daten fehlen
  const waveHeight = marineData?.wave_height || 1.0;
  const wavePeriod = marineData?.wave_period || 8;
  const windSpeed = weatherData?.wind_speed || 15;
  const windDirection = weatherData?.wind_direction || 0;
  const temperature = weatherData?.temperature || 20;

  const result = {
    ...spot,
    windrichtung: getWindDirection(windDirection),
    windgeschwindigkeit: Math.round(windSpeed),
    temperatur: Math.round(temperature),
    wellenhöhe: Number(waveHeight.toFixed(1)),
    wellengeschwindigkeit: Math.round(wavePeriod * 3.6), // Periode in km/h umrechnen
    qualität: getQuality(windSpeed, waveHeight),
  };

  console.log('Final spot data for', spot.name, ':', result);
  
  return result;
}

// Lade alle Spots mit echten API-Daten
export async function fetchAllSpotsData(spots: KiteSpot[]) {
  console.log('Fetching data for', spots.length, 'spots');
  const promises = spots.map(spot => fetchSpotData(spot));
  const results = await Promise.all(promises);
  console.log('All spots data loaded:', results);
  return results;
}
