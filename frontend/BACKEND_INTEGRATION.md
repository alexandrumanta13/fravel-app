# 🔄 Backend Integration - Airports & Cities Components

## Overview

The flight booking components have been refactored to seamlessly integrate with the new backend API while maintaining backward compatibility with the legacy Kiwi API service.

---

## 🏗️ Architecture

### Service Layer Architecture

```
┌─────────────────────────┐
│   Flight Components     │
├─────────────────────────┤
│ • select-departure      │
│ • select-destination    │
└─────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│   AirportsService       │ ← Main service interface
├─────────────────────────┤
│ • Feature flagging      │
│ • Auto-fallback        │
│ • Service switching     │
└─────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐ ┌─────────────────────┐
│ Legacy  │ │ BackendAirports     │
│ (Kiwi)  │ │ Service             │
│ API     │ │                     │
└─────────┘ └─────────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

**Development** (`environment.ts`):
```typescript
export const environment = {
  // ... other config
  backendUrl: 'http://localhost:3000',
  useBackendAirports: true, // Enable backend service
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  // ... other config
  backendUrl: 'https://api.fravel.ro',
  useBackendAirports: false, // Use legacy until fully tested
};
```

---

## 🚀 New Features

### Enhanced Search Experience

#### 1. **Debounced Search**
- 300ms delay after user stops typing
- Prevents excessive API calls
- Smoother user experience

#### 2. **Recent Searches**
- Stores last 5 searches in localStorage
- Quick access to previous searches
- Separate storage for departure/destination

#### 3. **Popular Destinations**
- Shows popular airports/cities when no search
- Loads from backend API when available
- Fallback for empty state

#### 4. **Smart Error Handling**
- Automatic fallback from backend to legacy
- Retry functionality
- User-friendly error messages

#### 5. **Service Mode Indicator**
- Visual indicator of current service (backend/legacy)
- Debug toggle for development
- Real-time service switching

---

## 🔄 Service Switching Logic

### Auto-Configuration Flow

```typescript
async autoConfigureService() {
  const backendAvailable = await checkBackendHealth();
  
  if (backendAvailable && !useBackendService) {
    console.log('Switching to backend mode');
    toggleServiceMode(true);
  } else if (!backendAvailable && useBackendService) {
    console.log('Switching to legacy mode');
    toggleServiceMode(false);
  }
}
```

### Fallback Strategy

1. **Primary**: Try backend service
2. **Fallback**: Switch to legacy Kiwi API
3. **Error**: Show user-friendly message with retry

---

## 🎯 Component Features

### SelectDepartureComponent / SelectDestinationComponent

#### New Properties
```typescript
// Loading states
isLoading: boolean = false;
searchError: string = '';

// Enhanced functionality  
recentSearches: string[] = [];
popularDestinations: ConvertedAirport[] = [];
serviceMode: 'backend' | 'legacy' = 'legacy';

// RxJS subjects
private destroy$ = new Subject<void>();
private searchTerms = new Subject<string>();
```

#### New Methods
```typescript
// Enhanced search with debouncing
searchDeparture() / searchDestination()

// Recent searches management
selectRecentSearch(search: string)
clearRecentSearches()

// Popular destinations
selectPopularDestination(destination: ConvertedAirport)
loadPopularDestinations()

// Error handling
retryLastSearch()

// Service management
toggleServiceMode()
```

---

## 📡 API Integration

### Backend API Endpoints

```typescript
// Universal search across airports, cities, countries
GET /api/locations/search?query=London&limit=20

// Specific airport search
GET /api/locations/airports/search?query=Heathrow

// City search
GET /api/locations/cities/search?query=London

// Nearby search
POST /api/locations/nearby
{
  "latitude": 51.5074,
  "longitude": -0.1278,
  "radiusKm": 100
}

// Airport details
GET /api/locations/airports/LHR

// Popular destinations
GET /api/locations/popular?limit=10
```

### Data Transformation

Backend data is converted to legacy format for component compatibility:

```typescript
convertBackendAirportToLegacy(backendAirport: BackendAirport): ConvertedAirport {
  return {
    // Legacy format fields
    id: backendAirport.iataCode || backendAirport.id.toString(),
    name: backendAirport.name,
    city: {
      id: backendAirport.cityId?.toString(),
      name: backendAirport.cityName,
      country: {
        name: backendAirport.countryCode,
        code: backendAirport.countryCode
      }
    },
    
    // Enhanced fields from backend
    iataCode: backendAirport.iataCode,
    icaoCode: backendAirport.icaoCode,
    latitude: backendAirport.latitude,
    longitude: backendAirport.longitude,
    type: backendAirport.type,
    facilities: backendAirport.facilities
  };
}
```

---

## 🎨 UI Enhancements

### Loading States
```html
<div class="loading-indicator" *ngIf="isLoading">
  <div class="spinner"></div>
</div>
```

### Error States
```html
<div class="error-state" *ngIf="searchError">
  <div class="error-message">
    <i class="icon-alert-triangle"></i>
    <span>{{ searchError }}</span>
    <button class="retry-btn" (click)="retryLastSearch()">Retry</button>
  </div>
</div>
```

### Recent Searches
```html
<div class="recent-searches" *ngIf="!departure && recentSearches.length > 0">
  <div class="section-header">
    <h4>Recent Searches</h4>
    <button class="clear-btn" (click)="clearRecentSearches()">Clear</button>
  </div>
  <div class="recent-list">
    <button 
      *ngFor="let search of recentSearches"
      class="recent-item"
      (click)="selectRecentSearch(search)"
    >
      <i class="icon-clock"></i>
      {{ search }}
    </button>
  </div>
</div>
```

### Popular Destinations
```html
<div class="popular-destinations" *ngIf="popularDestinations.length > 0">
  <div class="section-header">
    <h4>Popular Destinations</h4>
  </div>
  <div class="popular-grid">
    <button 
      *ngFor="let destination of popularDestinations"
      class="popular-item"
      (click)="selectPopularDestination(destination)"
    >
      <div class="destination-info">
        <span class="city">{{ destination.city.name }}</span>
        <small class="airport">{{ destination.name }}</small>
        <span class="code" *ngIf="destination.iataCode">{{ destination.iataCode }}</span>
      </div>
    </button>
  </div>
</div>
```

---

## 🧪 Testing

### Development Mode Features

1. **Service Mode Toggle**
   - Debug panel in bottom-right corner
   - Switch between backend/legacy in real-time
   - Visual indicator of current service

2. **Error Simulation**
   - Force service failures for testing
   - Verify fallback mechanisms
   - Test error recovery

### Testing Scenarios

```typescript
// Test backend service
environment.useBackendAirports = true;
// Search for "London" - should use backend API

// Test fallback
// Stop backend server
// Search for "Paris" - should fallback to Kiwi API

// Test recent searches
// Perform searches, refresh page, verify persistence

// Test popular destinations
// Clear search input, verify popular destinations load
```

---

## 📊 Performance Benefits

### Backend Service Advantages

1. **Comprehensive Data**
   - Airport facilities, contact info
   - IATA/ICAO codes for all airports
   - Geographical data (lat/lng, elevation)
   - Airport types and classifications

2. **Better Search Relevance**
   - Advanced scoring algorithm
   - Multiple search criteria
   - Fuzzy matching

3. **Enhanced Filtering**
   - Filter by airport type
   - International vs domestic
   - Active vs inactive airports

4. **Local Data**
   - No external API dependencies
   - Faster response times
   - Offline capability (cached data)

### Legacy Service Benefits

1. **Proven Reliability**
   - Battle-tested Kiwi API
   - Consistent data format
   - Known performance characteristics

2. **Image Integration**
   - City/airport images from Kiwi
   - Visual background for selections

---

## 🔐 Error Handling

### Service Health Monitoring

```typescript
// Check backend availability
async checkBackendAvailability(): Promise<boolean> {
  try {
    return await this.backendAirportsService.checkBackendHealth();
  } catch {
    return false;
  }
}

// Auto-configure based on availability
await this.autoConfigureService();
```

### Graceful Degradation

1. **Backend Unavailable**: Fall back to Kiwi API
2. **Search Errors**: Show retry button
3. **No Results**: Show helpful empty state
4. **Network Issues**: Cache recent searches for offline access

---

## 🚦 Migration Path

### Phase 1: Development Testing ✅
- Backend service integration complete
- Feature flag enabled in development
- Comprehensive testing and debugging

### Phase 2: Beta Testing
- Enable backend service for limited users
- Monitor performance and error rates
- Collect user feedback

### Phase 3: Gradual Rollout
- Increase backend service percentage
- Monitor metrics and performance
- Keep legacy fallback active

### Phase 4: Full Migration
- Backend service as primary
- Legacy service as fallback only
- Remove legacy dependencies

---

## 🛠️ Debugging

### Debug Console Commands

```javascript
// Check current service mode
window._airportsService = this._AirportsService;
window._airportsService.getCurrentServiceMode();

// Toggle service mode
window._airportsService.toggleServiceMode(true); // backend
window._airportsService.toggleServiceMode(false); // legacy

// Check backend health
await window._airportsService.checkBackendAvailability();

// Clear cached searches
localStorage.removeItem('recentDepartureSearches');
localStorage.removeItem('recentDestinationSearches');
```

### Monitoring Points

1. **Service Selection**: Which service is being used
2. **API Response Times**: Backend vs Legacy performance
3. **Error Rates**: Success/failure ratios
4. **User Behavior**: Recent searches usage, popular destinations clicks
5. **Fallback Frequency**: How often backend falls back to legacy

---

This refactoring provides a robust, flexible architecture that enhances the user experience while ensuring reliability through smart fallback mechanisms.

---

## 🌍 Backend Data Seeding - Cities & Flight Operators

### Overview

Când backend-ul va fi gata pentru producție, va fi nevoie să populezi baza de date cu orașele și operatorii de zbor. Iată comenzile și scripturile necesare pentru seeding-ul datelor.

---

### 🏙️ Cities Data Seeding

#### Import Cities from OpenFlights Dataset

```bash
# Download OpenFlights cities dataset
curl -o cities.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/cities.dat

# Import cities into PostgreSQL
node src/scripts/seed-cities.js
```

#### Manual Cities Addition

```sql
-- Add major Romanian cities with image URLs
INSERT INTO cities (name, country_code, latitude, longitude, population, timezone, image_url) VALUES
('București', 'RO', 44.4268, 26.1025, 1883425, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1565374361156-6c1984c81b74'),
('Cluj-Napoca', 'RO', 46.7712, 23.6236, 324576, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72'),
('Timișoara', 'RO', 45.7489, 21.2087, 319279, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1571170561541-5c38d3ee4b19'),
('Iași', 'RO', 47.1585, 27.6014, 290422, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1592753385071-8ba6ecfaf05f'),
('Constanța', 'RO', 44.1598, 28.6348, 283872, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1595146326437-e2b9b1f9b3ab'),
('Craiova', 'RO', 44.3302, 23.7949, 269506, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1601566341745-d815e8b83a7d'),
('Brașov', 'RO', 45.6427, 25.5887, 253200, 'Europe/Bucharest', 'https://images.unsplash.com/photo-1540759851667-f9a4f64a8015');

-- Add major European cities with image URLs
INSERT INTO cities (name, country_code, latitude, longitude, population, timezone, image_url) VALUES
('London', 'GB', 51.5074, -0.1278, 8982000, 'Europe/London', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('Paris', 'FR', 48.8566, 2.3522, 2161000, 'Europe/Paris', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52'),
('Berlin', 'DE', 52.5200, 13.4050, 3669000, 'Europe/Berlin', 'https://images.unsplash.com/photo-1560969184-10fe8719e047'),
('Rome', 'IT', 41.9028, 12.4964, 2873000, 'Europe/Rome', 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b'),
('Madrid', 'ES', 40.4168, -3.7038, 3223000, 'Europe/Madrid', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4'),
('Amsterdam', 'NL', 52.3676, 4.9041, 821752, 'Europe/Amsterdam', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017'),
('Vienna', 'AT', 48.2082, 16.3738, 1911000, 'Europe/Vienna', 'https://images.unsplash.com/photo-1516550893923-42d28e5677af'),
('Prague', 'CZ', 50.0755, 14.4378, 1318000, 'Europe/Prague', 'https://images.unsplash.com/photo-1541849546-216549ae216d');
```

#### Script pentru Seeding Cities

```javascript
// src/scripts/seed-cities.js
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fravel_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function seedCities() {
  console.log('Starting cities seeding...');
  
  const cities = [];
  
  // Read cities from OpenFlights dataset
  fs.createReadStream('cities.dat')
    .pipe(csv({
      headers: ['id', 'name', 'country', 'country_code', 'latitude', 'longitude', 'timezone'],
      separator: ','
    }))
    .on('data', (data) => {
      if (data.latitude && data.longitude && data.name && data.country_code) {
        cities.push({
          name: data.name,
          country_code: data.country_code,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          timezone: data.timezone || 'UTC'
        });
      }
    })
    .on('end', async () => {
      console.log(`Parsed ${cities.length} cities`);
      
      // Batch insert cities
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (const city of cities) {
          await client.query(
            `INSERT INTO cities (name, country_code, latitude, longitude, timezone) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (name, country_code) DO NOTHING`,
            [city.name, city.country_code, city.latitude, city.longitude, city.timezone]
          );
        }
        
        await client.query('COMMIT');
        console.log('Cities seeding completed successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding cities:', error);
      } finally {
        client.release();
        pool.end();
      }
    });
}

seedCities();
```

---

### ✈️ Flight Operators (Airlines) Seeding

#### Import Airlines from OpenFlights Dataset

```bash
# Download OpenFlights airlines dataset
curl -o airlines.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat

# Import airlines into PostgreSQL
node src/scripts/seed-airlines.js
```

#### Manual Airlines Addition

```sql
-- Add major Romanian airlines
INSERT INTO airlines (iata_code, icao_code, name, country_code, is_active) VALUES
('RO', 'ROT', 'TAROM', 'RO', true),
('0B', 'BMS', 'Blue Air', 'RO', true),
('WZ', 'WZZ', 'Wizz Air', 'HU', true);

-- Add major European airlines
INSERT INTO airlines (iata_code, icao_code, name, country_code, is_active) VALUES
('LH', 'DLH', 'Lufthansa', 'DE', true),
('AF', 'AFR', 'Air France', 'FR', true),
('KL', 'KLM', 'KLM Royal Dutch Airlines', 'NL', true),
('BA', 'BAW', 'British Airways', 'GB', true),
('IB', 'IBE', 'Iberia', 'ES', true),
('AZ', 'AZA', 'Alitalia', 'IT', true),
('OS', 'AUA', 'Austrian Airlines', 'AT', true),
('SN', 'BEL', 'Brussels Airlines', 'BE', true),
('SK', 'SAS', 'Scandinavian Airlines', 'SE', true),
('TP', 'TAP', 'TAP Air Portugal', 'PT', true);

-- Add low-cost airlines
INSERT INTO airlines (iata_code, icao_code, name, country_code, is_active, is_low_cost) VALUES
('FR', 'RYR', 'Ryanair', 'IE', true, true),
('U2', 'EZY', 'easyJet', 'GB', true, true),
('VY', 'VLG', 'Vueling', 'ES', true, true),
('EW', 'EWG', 'Eurowings', 'DE', true, true),
('W6', 'WZZ', 'Wizz Air', 'HU', true, true);
```

#### Script pentru Seeding Airlines

```javascript
// src/scripts/seed-airlines.js
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'fravel_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function seedAirlines() {
  console.log('Starting airlines seeding...');
  
  const airlines = [];
  
  // Read airlines from OpenFlights dataset
  fs.createReadStream('airlines.dat')
    .pipe(csv({
      headers: ['id', 'name', 'alias', 'iata_code', 'icao_code', 'callsign', 'country', 'active'],
      separator: ','
    }))
    .on('data', (data) => {
      if (data.name && (data.iata_code || data.icao_code)) {
        airlines.push({
          name: data.name.replace(/"/g, ''),
          iata_code: data.iata_code !== '\\N' ? data.iata_code : null,
          icao_code: data.icao_code !== '\\N' ? data.icao_code : null,
          country: data.country.replace(/"/g, ''),
          is_active: data.active === 'Y'
        });
      }
    })
    .on('end', async () => {
      console.log(`Parsed ${airlines.length} airlines`);
      
      // Batch insert airlines
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (const airline of airlines) {
          await client.query(
            `INSERT INTO airlines (name, iata_code, icao_code, country_code, is_active) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (iata_code) DO UPDATE SET 
               name = EXCLUDED.name,
               icao_code = EXCLUDED.icao_code,
               is_active = EXCLUDED.is_active`,
            [airline.name, airline.iata_code, airline.icao_code, airline.country, airline.is_active]
          );
        }
        
        await client.query('COMMIT');
        console.log('Airlines seeding completed successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding airlines:', error);
      } finally {
        client.release();
        pool.end();
      }
    });
}

seedAirlines();
```

---

### 🛠️ Complete Seeding Commands

#### Package.json Scripts

```json
{
  "scripts": {
    "seed:cities": "node src/scripts/seed-cities.js",
    "seed:airlines": "node src/scripts/seed-airlines.js",
    "seed:airports": "node src/scripts/seed-airports.js",
    "seed:all": "npm run seed:cities && npm run seed:airlines && npm run seed:airports",
    "download:data": "curl -o cities.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/cities.dat && curl -o airlines.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat && curl -o airports.dat https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
  }
}
```

#### Complete Setup Commands

```bash
# 1. Download all OpenFlights data
npm run download:data

# 2. Seed all data
npm run seed:all

# 3. Verify data
psql -d fravel_db -c "SELECT COUNT(*) FROM cities;"
psql -d fravel_db -c "SELECT COUNT(*) FROM airlines;"
psql -d fravel_db -c "SELECT COUNT(*) FROM airports;"

# 4. Create indexes for performance
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);"
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_code);"
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_airlines_iata ON airlines(iata_code);"
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_airlines_icao ON airlines(icao_code);"
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);"
psql -d fravel_db -c "CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city_id);"
```

---

### 🔍 Data Verification Queries

```sql
-- Check cities count by country
SELECT country_code, COUNT(*) as city_count 
FROM cities 
GROUP BY country_code 
ORDER BY city_count DESC 
LIMIT 10;

-- Check active airlines
SELECT name, iata_code, icao_code, country_code 
FROM airlines 
WHERE is_active = true 
ORDER BY name;

-- Check airports with cities
SELECT a.name as airport_name, a.iata_code, c.name as city_name, c.country_code
FROM airports a
JOIN cities c ON a.city_id = c.id
WHERE a.iata_code IS NOT NULL
ORDER BY c.country_code, c.name;

-- Check database sizes
SELECT 
  'cities' as table_name, COUNT(*) as record_count 
FROM cities
UNION ALL
SELECT 
  'airlines' as table_name, COUNT(*) as record_count 
FROM airlines
UNION ALL
SELECT 
  'airports' as table_name, COUNT(*) as record_count 
FROM airports;
```

---

### 📋 Required Dependencies

```bash
# Install CSV parser and PostgreSQL client
npm install csv-parser pg dotenv

# For TypeScript projects
npm install -D @types/pg
```

---

### 🔐 Environment Setup

```bash
# .env file pentru seeding scripts
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fravel_db
DB_USER=postgres
DB_PASSWORD=your_password

# Production environment
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=fravel_production
DB_USER=production_user
DB_PASSWORD=secure_password

# API Keys pentru imagini (opțional)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
GOOGLE_PLACES_API_KEY=your_google_places_key
```

---

## 🖼️ City Images Integration

### Overview

**IMPORTANT**: OpenFlights dataset-ul **NU include imagini** pentru orașe. Pentru imagini reprezentative ale orașelor, vei avea nevoie de servicii externe.

### Recommended Image Sources

#### 1. **Unsplash API** (Gratuit, Calitate Înaltă)
```javascript
// src/scripts/fetch-city-images.js
const fetchUnsplashImage = async (cityName) => {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
  );
  const data = await response.json();
  return data.results[0]?.urls?.regular || null;
};
```

#### 2. **Pexels API** (Gratuit, Stock Photos)
```javascript
const fetchPexelsImage = async (cityName) => {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${cityName}&per_page=1`,
    {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      }
    }
  );
  const data = await response.json();
  return data.photos[0]?.src?.large || null;
};
```

#### 3. **Manual Curation** (Recomandat pentru Producție)
```sql
-- Update cities cu imagini curate manual
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1565374361156-6c1984c81b74' WHERE name = 'București';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72' WHERE name = 'Cluj-Napoca';
-- ... etc
```

### Image Fetching Script

```javascript
// src/scripts/update-city-images.js
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updateCityImages() {
  console.log('Starting city images update...');
  
  const client = await pool.connect();
  
  try {
    // Get cities without images
    const result = await client.query(
      'SELECT id, name, country_code FROM cities WHERE image_url IS NULL LIMIT 50'
    );
    
    for (const city of result.rows) {
      console.log(`Fetching image for ${city.name}...`);
      
      // Try Unsplash first
      let imageUrl = await fetchUnsplashImage(`${city.name} city`);
      
      // Fallback to Pexels
      if (!imageUrl) {
        imageUrl = await fetchPexelsImage(`${city.name} city`);
      }
      
      if (imageUrl) {
        await client.query(
          'UPDATE cities SET image_url = $1 WHERE id = $2',
          [imageUrl, city.id]
        );
        console.log(`✅ Updated ${city.name} with image`);
      } else {
        console.log(`❌ No image found for ${city.name}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('Error updating city images:', error);
  } finally {
    client.release();
    pool.end();
  }
}

async function fetchUnsplashImage(query) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
    );
    const data = await response.json();
    return data.results[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Unsplash API error:', error);
    return null;
  }
}

async function fetchPexelsImage(query) {
  if (!process.env.PEXELS_API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      }
    );
    const data = await response.json();
    return data.photos[0]?.src?.large || null;
  } catch (error) {
    console.error('Pexels API error:', error);
    return null;
  }
}

updateCityImages();
```

### Database Schema Update

```sql
-- Add image_url column to cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_cities_image_url ON cities(image_url) WHERE image_url IS NOT NULL;
```

### Package.json Scripts Update

```json
{
  "scripts": {
    "seed:cities": "node src/scripts/seed-cities.js",
    "seed:airlines": "node src/scripts/seed-airlines.js",
    "seed:airports": "node src/scripts/seed-airports.js",
    "update:city-images": "node src/scripts/update-city-images.js",
    "seed:all": "npm run seed:cities && npm run seed:airlines && npm run seed:airports && npm run update:city-images"
  }
}
```

### Image Optimization Tips

1. **Use CDN URLs**: Unsplash și Pexels oferă CDN-uri rapide
2. **Cache Images**: Salvează imaginile local pentru performanță
3. **Fallback Images**: Ai întotdeauna o imagine default
4. **Lazy Loading**: Încarcă imaginile doar când sunt necesare
5. **Responsive Images**: Folosește diferite rezoluții pentru mobile/desktop

### Frontend Integration

```typescript
// În BackendAirportsService
export interface BackendCity {
  id: number;
  name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  image_url?: string; // Nou câmp pentru imagini
}

// În componente
<div class="city-card" 
     [style.background-image]="'url(' + (city.image_url || '/assets/images/default-city.jpg') + ')'">
  <h3>{{ city.name }}</h3>
</div>
```