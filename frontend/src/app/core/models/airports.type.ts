export interface Airports {
  // last_refresh: number,
  id: string;
  locations: Airport[];
  // meta: {},
  // results_retrieved: number
}
[];

export interface AirportsByCountry {
  [key: string]: Airport[];
}

export interface Airport {
  id: string;
  name: string;
  continent: any;
  city: {
    id: string;
    name: string;
    continent: any;
    country: {
      name: string;
    };
  };
  country: {
    name: string;
  };
  airport_int_id: string;
  alternative_names: string[];
}
[];
