import axios from 'axios';

/**
 * Free Weather Service using Open-Meteo API
 * 
 * Open-Meteo is completely FREE with no API key required!
 * - No rate limits for non-commercial use
 * - Real-time weather data
 * - Historical weather data
 * - 7-day forecasts
 * 
 * API Docs: https://open-meteo.com/en/docs
 */

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  timestamp: string;
}

export class FreeWeatherService {
  private readonly API_BASE = 'https://api.open-meteo.com/v1';
  
  /**
   * Get weather for a city (coordinates needed)
   */
  async getWeatherForCity(city: string): Promise<WeatherData | null> {
    try {
      // First, geocode the city to get coordinates
      const coords = await this.geocodeCity(city);
      if (!coords) {
        console.log(`⚠️  Could not geocode city: ${city}`);
        return null;
      }
      
      return await this.getWeatherForCoordinates(coords.lat, coords.lon);
    } catch (error: any) {
      console.error(`❌ Failed to get weather for ${city}:`, error.message);
      return null;
    }
  }
  
  /**
   * Get weather for specific coordinates
   */
  async getWeatherForCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const url = `${this.API_BASE}/forecast`;
      const response = await axios.get(url, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation,surface_pressure,cloud_cover,visibility',
          timezone: 'auto',
        },
        timeout: 10000,
      });
      
      const current = response.data.current;
      
      return {
        temperature: current.temperature_2m,
        weatherCode: current.weather_code,
        weatherDescription: this.getWeatherDescription(current.weather_code),
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        pressure: current.surface_pressure,
        cloudCover: current.cloud_cover,
        visibility: current.visibility,
        timestamp: current.time,
      };
    } catch (error: any) {
      console.error(`❌ Failed to get weather:`, error.message);
      return null;
    }
  }
  
  /**
   * Geocode city name to coordinates using Open-Meteo's geocoding API (FREE)
   */
  private async geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = 'https://geocoding-api.open-meteo.com/v1/search';
      const response = await axios.get(url, {
        params: {
          name: city,
          count: 1,
          language: 'en',
          format: 'json',
        },
        timeout: 5000,
      });
      
      const results = response.data.results;
      if (!results || results.length === 0) {
        return null;
      }
      
      return {
        lat: results[0].latitude,
        lon: results[0].longitude,
      };
    } catch (error: any) {
      console.error(`❌ Geocoding failed:`, error.message);
      return null;
    }
  }
  
  /**
   * Convert WMO weather code to description
   * https://open-meteo.com/en/docs
   */
  private getWeatherDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    
    return weatherCodes[code] || 'Unknown';
  }
}

export const freeWeatherService = new FreeWeatherService();
