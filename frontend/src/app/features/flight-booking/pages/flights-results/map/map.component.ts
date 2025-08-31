import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  Input,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// AmCharts 5 imports - install with: npm install @amcharts/amcharts5
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

import { FlightsResultsService } from '../flights-results.service';

export interface MapCity {
  id: string;
  title: string;
  coordinates: [number, number];
  isOrigin?: boolean;
  isDestination?: boolean;
  flightCount?: number;
}

export interface FlightRoute {
  from: MapCity;
  to: MapCity;
  flightCount: number;
  minPrice?: number;
  airlines: string[];
  animated?: boolean;
}

@Component({
  selector: 'app-flight-map',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class FlightMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapDiv', { static: true }) mapDiv!: ElementRef<HTMLDivElement>;
  
  @Input() showControls = true;
  @Input() showAnimation = true;
  @Input() darkMode = false;

  private readonly flightsService = inject(FlightsResultsService);
  
  // Signals for reactive state
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _mapType = signal<'flat' | 'globe'>('flat');
  private readonly _showFlightPaths = signal(true);
  private readonly _selectedRoute = signal<FlightRoute | null>(null);

  // Public readonly signals
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly mapType = this._mapType.asReadonly();
  public readonly showFlightPaths = this._showFlightPaths.asReadonly();
  public readonly selectedRoute = this._selectedRoute.asReadonly();

  // Computed flight routes from service data
  public readonly flightRoutes = computed(() => {
    const flights = this.flightsService.filteredFlights();
    return this.extractFlightRoutes(flights);
  });

  public readonly mapCities = computed(() => {
    const routes = this.flightRoutes();
    const cityMap = new Map<string, MapCity>();

    routes.forEach(route => {
      if (!cityMap.has(route.from.id)) {
        cityMap.set(route.from.id, { ...route.from, isOrigin: true });
      }
      if (!cityMap.has(route.to.id)) {
        cityMap.set(route.to.id, { ...route.to, isDestination: true });
      }
    });

    return Array.from(cityMap.values());
  });

  // AmCharts instances
  private root: am5.Root | null = null;
  private chart: am5map.MapChart | null = null;
  private polygonSeries: am5map.MapPolygonSeries | null = null;
  private lineSeries: am5map.MapLineSeries | null = null;
  private citySeries: am5map.MapPointSeries | null = null;
  private planeSeries: am5map.MapPointSeries | null = null;

  constructor() {
    // React to flight data changes
    effect(() => {
      if (this.chart && this.flightRoutes().length > 0) {
        this.updateMapData();
      }
    });

    // React to map type changes
    effect(() => {
      if (this.chart) {
        this.updateMapProjection();
      }
    });
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.disposeChart();
  }

  private async initializeMap(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      await this.createAmChartsMap();
      this.setupMapSeries();
      this.updateMapData();

      console.log('Flight map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      this._error.set('Failed to load map');
    } finally {
      this._isLoading.set(false);
    }
  }

  private async createAmChartsMap(): Promise<void> {
    // Create root element
    this.root = am5.Root.new(this.mapDiv.nativeElement);

    // Set themes
    const themes = [am5themes_Animated.new(this.root)];
    if (this.darkMode) {
      themes.push(am5themes_Dark.new(this.root));
    }
    this.root.setThemes(themes);

    // Create the map chart
    this.chart = this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        wheelY: "zoom",
        maxZoomLevel: 8,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20
      })
    );

    // Add map background
    this.chart.chartContainer.set("background", am5.Rectangle.new(this.root, {
      fill: am5.color(this.darkMode ? 0x1a1a1a : 0xf0f8ff),
      fillOpacity: 1
    }));
  }

  private setupMapSeries(): void {
    if (!this.root || !this.chart) return;

    // Create polygon series for countries
    this.polygonSeries = this.chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"] // Exclude Antarctica
      })
    );

    // Style countries
    this.polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(this.darkMode ? 0x404040 : 0xe6f2ff),
      stroke: am5.color(this.darkMode ? 0x606060 : 0xcccccc),
      strokeWidth: 0.5
    });

    // Add hover effects
    this.polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(this.darkMode ? 0x555555 : 0xddeeff)
    });

    // Create line series for flight paths
    this.lineSeries = this.chart.series.push(
      am5map.MapLineSeries.new(this.root, {})
    );

    // Style flight paths
    this.lineSeries.mapLines.template.setAll({
      stroke: am5.color(0x3b82f6), // Blue color for flight paths
      strokeWidth: 2,
      strokeOpacity: 0.8,
      strokeDasharray: [4, 4] // Dashed line
    });

    // Add hover effect to flight paths
    this.lineSeries.mapLines.template.states.create("hover", {
      strokeWidth: 3,
      strokeOpacity: 1
    });

    // Create city point series
    this.citySeries = this.chart.series.push(
      am5map.MapPointSeries.new(this.root, {})
    );

    // Style city points
    this.citySeries.bullets.push(() => {
      const circle = am5.Circle.new(this.root!, {
        radius: 6,
        fill: am5.color(0xf59e0b), // Amber color for cities
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
        tooltipText: "{title}",
        cursorOverStyle: "pointer"
      });

      circle.states.create("hover", {
        scale: 1.3
      });

      return am5.Bullet.new(this.root!, {
        sprite: circle
      });
    });

    // Create plane series for animated planes
    this.planeSeries = this.chart.series.push(
      am5map.MapPointSeries.new(this.root, {})
    );

    // Style animated planes
    this.planeSeries.bullets.push(() => {
      const plane = am5.Graphics.new(this.root!, {
        fill: am5.color(0x10b981), // Green color for planes
        stroke: am5.color(0xffffff),
        strokeWidth: 1,
        svgPath: "M2,106h28l24,30h72v-24h-24l-8-14h32l-8-12h16v-12h-16l8-12h-32l8-14h24v-24H50L26,104H2z", // Plane SVG path
        scale: 0.1,
        centerX: am5.p50,
        centerY: am5.p50
      });

      return am5.Bullet.new(this.root!, {
        sprite: plane
      });
    });
  }

  private updateMapData(): void {
    if (!this.citySeries || !this.lineSeries || !this.planeSeries) return;

    const cities = this.mapCities();
    const routes = this.flightRoutes();

    // Update cities data
    const citiesData = cities.map(city => ({
      id: city.id,
      title: city.title,
      longitude: city.coordinates[0],
      latitude: city.coordinates[1],
      isOrigin: city.isOrigin,
      isDestination: city.isDestination
    }));

    this.citySeries.data.setAll(citiesData);

    if (this.showFlightPaths()) {
      // Update flight paths
      const routesData = routes.map(route => ({
        geometry: {
          type: "LineString",
          coordinates: [
            route.from.coordinates,
            route.to.coordinates
          ]
        },
        route: route
      }));

      this.lineSeries.data.setAll(routesData);

      // Add click handlers to flight paths
      this.lineSeries.mapLines.template.onPrivate("maskRectangle", () => {
        this.lineSeries!.mapLines.template.on("click", (ev) => {
          const route = ev.target.dataItem?.dataContext as { route: FlightRoute };
          if (route) {
            this._selectedRoute.set(route.route);
            this.animatePlaneAlongRoute(route.route);
          }
        });
      });

      // Auto-fit map to show all routes
      this.autoFitMap();
    }
  }

  private animatePlaneAlongRoute(route: FlightRoute): void {
    if (!this.planeSeries || !this.root) return;

    // Create animated plane
    const planeData = {
      longitude: route.from.coordinates[0],
      latitude: route.from.coordinates[1],
      lineDataItem: this.lineSeries?.mapLines.getIndex(0), // Get first line as reference
      positionOnLine: 0,
      autoRotate: true
    };

    this.planeSeries.data.pushAll([planeData]);

    // Animate plane along route
    const planeDataItem = this.planeSeries.dataItems[this.planeSeries.dataItems.length - 1];
    if (planeDataItem) {
      planeDataItem.animate({
        key: "positionOnLine",
        to: 1,
        duration: 3000,
        easing: am5.ease.inOut(am5.ease.cubic)
      }).then(() => {
        // Remove plane after animation
        this.planeSeries?.data.removeValue(planeData);
      });
    }
  }

  private extractFlightRoutes(flights: any[]): FlightRoute[] {
    const routeMap = new Map<string, FlightRoute>();

    flights.forEach(flight => {
      const fromKey = `${flight.cityCodeFrom}_${flight.cityFrom}`;
      const toKey = `${flight.cityCodeTo}_${flight.cityTo}`;
      const routeKey = `${fromKey}-${toKey}`;

      const fromCoords = this.getCityCoordinates(flight.cityCodeFrom) || [0, 0] as [number, number];
      const toCoords = this.getCityCoordinates(flight.cityCodeTo) || [0, 0] as [number, number];

      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, {
          from: {
            id: flight.cityCodeFrom,
            title: flight.cityFrom,
            coordinates: fromCoords
          },
          to: {
            id: flight.cityCodeTo,
            title: flight.cityTo,
            coordinates: toCoords
          },
          flightCount: 1,
          minPrice: flight.price,
          airlines: [flight.airline || flight.airlines?.[0]].filter(Boolean)
        });
      } else {
        const route = routeMap.get(routeKey)!;
        route.flightCount++;
        route.minPrice = Math.min(route.minPrice || flight.price, flight.price);
        
        const airline = flight.airline || flight.airlines?.[0];
        if (airline && !route.airlines.includes(airline)) {
          route.airlines.push(airline);
        }
      }
    });

    return Array.from(routeMap.values());
  }

  private getCityCoordinates(cityCode: string): [number, number] | null {
    // Extended city coordinates database
    const cityCoords: { [key: string]: [number, number] } = {
      // Major European cities
      'LON': [-0.1262, 51.5002],    // London
      'PAR': [2.3510, 48.8567],     // Paris
      'BRU': [4.3676, 50.8371],     // Brussels
      'PRG': [14.4205, 50.0878],    // Prague
      'ATH': [23.7166, 37.9792],    // Athens
      'REK': [-21.8952, 64.1353],   // Reykjavik
      'DUB': [-6.2675, 53.3441],    // Dublin
      'OSL': [10.7387, 59.9138],    // Oslo
      'LIS': [-9.1355, 38.7072],    // Lisbon
      'MOW': [37.6176, 55.7558],    // Moscow
      'BEG': [20.4781, 44.8048],    // Belgrade
      'BTS': [17.1547, 48.2116],    // Bratislava
      'LJU': [14.5060, 46.0514],    // Ljubljana
      'MAD': [-3.7033, 40.4167],    // Madrid
      'STO': [18.0645, 59.3328],    // Stockholm
      'BRN': [7.4481, 46.9480],     // Bern
      'KIV': [30.5367, 50.4422],    // Kiev
      
      // Major international cities
      'NYC': [-74.0060, 40.7128],   // New York
      'LAX': [-118.2437, 34.0522],  // Los Angeles
      'TOK': [139.6917, 35.6895],   // Tokyo
      'BEJ': [116.4074, 39.9042],   // Beijing
      'DXB': [55.2708, 25.2048],    // Dubai
      'SIN': [103.8198, 1.3521],    // Singapore
      'HKG': [114.1694, 22.3193],   // Hong Kong
      'SYD': [151.2093, -33.8688],  // Sydney
      
      // Romanian cities
      'BUH': [26.1025, 44.4268],    // Bucharest
      'CLJ': [23.5725, 46.7712],    // Cluj-Napoca
      'IAS': [27.6014, 47.1585],    // Iasi
      'TSR': [21.2269, 45.7489],    // Timisoara
      'CND': [28.6348, 44.1598],    // Constanta
    };

    return cityCoords[cityCode] || null;
  }

  private autoFitMap(): void {
    if (!this.chart || !this.citySeries) return;

    // Get bounds of all cities
    const cities = this.mapCities();
    if (cities.length === 0) return;

    const lons = cities.map(city => city.coordinates[0]);
    const lats = cities.map(city => city.coordinates[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Add padding
    const lonPadding = (maxLon - minLon) * 0.2;
    const latPadding = (maxLat - minLat) * 0.2;

    // Zoom to fit all cities
    this.chart.zoomToRectangle(
      minLon - lonPadding,
      maxLat + latPadding,
      maxLon + lonPadding,
      minLat - latPadding
    );
  }

  private updateMapProjection(): void {
    if (!this.chart) return;

    const isGlobe = this.mapType() === 'globe';
    
    this.chart.set("projection", isGlobe ? am5map.geoOrthographic() : am5map.geoMercator());
    this.chart.set("panX", isGlobe ? "rotateX" : "translateX");
    this.chart.set("panY", isGlobe ? "rotateY" : "translateY");
  }

  private disposeChart(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
    }
  }

  // Public methods for component interaction
  public toggleMapType(): void {
    this._mapType.update(current => current === 'flat' ? 'globe' : 'flat');
  }

  public toggleFlightPaths(): void {
    this._showFlightPaths.update(current => !current);
    this.updateMapData();
  }

  public zoomToRoute(route: FlightRoute): void {
    if (!this.chart) return;

    const fromCoords = route.from.coordinates;
    const toCoords = route.to.coordinates;

    const minLon = Math.min(fromCoords[0], toCoords[0]);
    const maxLon = Math.max(fromCoords[0], toCoords[0]);
    const minLat = Math.min(fromCoords[1], toCoords[1]);
    const maxLat = Math.max(fromCoords[1], toCoords[1]);

    // Add padding
    const lonPadding = Math.max((maxLon - minLon) * 0.3, 5);
    const latPadding = Math.max((maxLat - minLat) * 0.3, 5);

    this.chart.zoomToRectangle(
      minLon - lonPadding,
      maxLat + latPadding,
      maxLon + lonPadding,
      minLat - latPadding
    );

    this._selectedRoute.set(route);
  }

  public resetZoom(): void {
    if (!this.chart) return;
    this.chart.goHome();
  }
}
