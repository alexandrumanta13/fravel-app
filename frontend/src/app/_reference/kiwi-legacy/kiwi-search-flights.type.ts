export interface KiwiSearchFlights {
  fly_from: string;
  fly_from_city_name: string;
  fly_from_airport_name: string;
  fly_to: string;
  fly_to_city_name: string;
  fly_to_airport_name: string;
  date_from: string;
  date_to: string;
  adults: number;
  children: number;
  infants: number;
  selected_cabins: string;
  adult_hold_bag: string;
  adult_hand_bag: string;
  child_hold_bag: string;
  child_hand_bag: string;
  curr: string;
  locale: string;
  flight_type: string;
  return_from?: string;
  return_to?: string;
  nights_in_dst_from?: number;
  nights_in_dst_to?: number;
  max_fly_duration?: number;
  one_for_city?: number;
  one_per_date?: number;
  mix_with_cabins?: string;
  fly_days?: string;
  fly_days_type?: string;
  ret_fly_days?: string;
  ret_fly_days_type?: string;
  only_working_days?: boolean;
  only_weekends?: boolean;
  partner_market?: string;
  price_from?: number;
  price_to?: number;
  dtime_from?: string;
  dtime_to?: string;
  atime_from?: string;
  atime_to?: string;
  ret_dtime_from?: string;
  ret_dtime_to?: string;
  ret_atime_from?: string;
  ret_atime_to?: string;
  stopover_from?: string;
  stopover_to?: string;
  max_stopovers?: number;
  max_sector_stopovers?: number;
  conn_on_diff_airport?: number;
  ret_from_diff_airport?: number;
  ret_to_diff_airport?: number;
  select_airlines?: string;
  select_airlines_exclude?: string;
  select_stop_airport?: string;
  select_stop_airport_exclude?: boolean;
  vehicle_type?: string;
  sort?: string;
  asc?: number;
  limit?: number;
  flights?: any;
  //v2
  local_arrival?: string;
  local_departure?: string;
  utc_arrival?: string;
  utc_departure?: string;
  duration?: {
    departure: number;
    return: number;
    total: number;
  };
}

export interface KiwiResponse {
  currency: string;
  data: KiwiFlightsResult[];
  fx_rate: number;
  search_id: string;
  _results: number;
}

export interface KiwiFlightsResult {
  id: string;
  flyFrom: string;
  flyTo: string;
  cityFrom: string;
  cityCodeFrom: string;
  cityTo: string;
  cityCodeTo: string;
  countryFrom: KiwiCountry;
  countryTo: KiwiCountry;
  local_departure: string;
  utc_departure: string;
  local_arrival: string;
  utc_arrival: string;
  nightsInDest: number;
  quality: number;
  distance: number;
  duration: KiwiDuration;
  price: number;
  conversion: Conversion;
  fare: Fare;
  price_dropdown: PriceDropdown;
  bags_price: BagsPrice;
  baglimit: Baglimit;
  availability: Availability;
  airlines: string[];
  route: KiwiRoute[];
  booking_token: string;
  facilitated_booking_available: boolean;
  pnr_count: number;
  has_airport_change: boolean;
  technical_stops: number;
  throw_away_ticketing: boolean;
  hidden_city_ticketing: boolean;
  virtual_interlining: boolean;
}

export interface Availability {
  seats: number;
}

export interface Baglimit {
  hold_dimensions_sum: number;
  hold_height: number;
  hold_length: number;
  hold_weight: number;
  hold_width: number;
  personal_item_height: number;
  personal_item_length: number;
  personal_item_weight: number;
  personal_item_width: number;
}

export interface BagsPrice {
  '1': number;
}

export interface Conversion {
  EUR: number;
  RON: number;
}

export interface KiwiCountry {
  code: string;
  name: string;
}

export interface KiwiDuration {
  departure: number;
  return: number;
  total: number;
}

export interface Fare {
  adults: number;
  children: number;
  infants: number;
}

export interface PriceDropdown {
  base_fare: number;
  fees: number;
}

export interface KiwiRoute {
  id: string;
  combination_id: string;
  flyFrom: string;
  flyTo: string;
  cityFrom: string;
  cityCodeFrom: string;
  cityTo: string;
  cityCodeTo: string;
  local_departure: string;
  utc_departure: string;
  local_arrival: string;
  utc_arrival: string;
  airline: string;
  flight_no: number;
  operating_carrier: string;
  operating_flight_no: string;
  fare_basis: string;
  fare_category: string;
  fare_classes: string;
  return: number;
  bags_recheck_required: boolean;
  vi_connection: boolean;
  guarantee: boolean;
  equipment: null;
  vehicle_type: string;
}

export interface CheckFlight {
  session_id: string;
  server_time: number;
  pnum: number;
  flights: Flight[];
  flights_checked: boolean;
  flights_to_check: boolean;
  flights_real_checked: boolean;
  flights_invalid: boolean;
  max_passengers: number;
  document_options: DocumentOptions;
  visas_agreement_requiered: boolean;
  transfers: any[];
  route: string[];
  book_fee: number;
  fee_airline: number;
  extra_fee: number;
  flights_price: number;
  passenger_change: boolean;
  price_change: boolean;
  total: number;
  orig_price_usage: boolean;
  sp_fee: number;
  flight_real_price: number;
  one_passenger: number;
  credits_price: number;
  tickets_price: number;
  orig_price: number;
  tickets_price_split: CurrentTicketsPriceSplit;
  adults_price: number;
  children_price: number;
  infants_price: number;
  current_tickets_price_split: CurrentTicketsPriceSplit;
  booking_token: string;
  infants_conditions: InfantsConditions;
  bags_price: { [key: string]: number };
  luggage: Array<number | null | string>;
  segments: any[];
  currency: Currency;
  conversion: Conversion;
  adult_threshold: number;
  age_category_thresholds: AgeCategoryThresholds;
  age_bookability_threshold: number;
  insurance_price: InsurancePrice;
  additional_services: AdditionalServices;
  margin_state_id: string;
  baggage: Baggage;
  mandatory_ancillaries: boolean;
  eur_payment_price: number;
}

export interface AdditionalServices {}

export interface AgeCategoryThresholds {
  adult: number;
  child: number;
}

export interface Baggage {
  definitions: Definitions;
  combinations: Combinations;
  notices: Notices;
}

export interface Combinations {
  hold_bag: DBag[];
  hand_bag: DBag[];
}

export interface DBag {
  indices: number[];
  category: string;
  conditions: HoldBagConditions;
  price: Price;
}

export interface HoldBagConditions {
  passenger_groups: PassengerGroup[];
}

export enum PassengerGroup {
  Adult = 'adult',
  Child = 'child',
  Infant = 'infant',
}

export interface Price {
  currency: Currency;
  amount: number;
  base: number;
  service: number;
  service_flat: number;
  merchant: number;
}

export enum Currency {
  Eur = 'EUR',
}

export interface Definitions {
  hold_bag: HoldBag[];
  hand_bag: HandBag[];
}

export interface HandBag {
  price: Price;
  conditions: PurpleConditions;
  is_hold: boolean;
  category: string;
  restrictions: Restrictions;
}

export interface PurpleConditions {
  passenger_groups: PassengerGroup[];
  is_priority?: string[];
}

export interface Restrictions {
  length: number;
  height: number;
  width: number;
  dimensions_sum: number;
  weight: number;
}

export interface HoldBag {
  price: Price;
  conditions: HoldBagConditions;
  is_hold: boolean;
  category: string;
  restrictions: Restrictions;
}

export interface Notices {
  has_stroller: boolean;
}

export interface Conversion {
  currency: string;
  amount: number;
  bags_price: { [key: string]: number };
  adults_price: number;
  children_price: number;
  infants_price: number;
}

export interface CurrentTicketsPriceSplit {
  currency: Currency;
  amount: string;
  base: string;
  service: string;
  service_flat: string;
  merchant: string;
}

export interface DocumentOptions {
  document_need: number;
  checkin_date: number;
  airport_checkin_price: number;
}

export interface Flight {
  airline: Airline;
  baggage_fare: string;
  carrier_segment_code: string;
  checkin: string;
  combination_prices: CombinationPrice[];
  combination_trip_id: string;
  dst: string;
  dst_country: string;
  dst_name: string;
  dst_station: string;
  dst_terminal: null;
  eur: number;
  eur_children: number;
  eur_infants: number;
  extras: string;
  fare_basis: string;
  fare_category: string;
  fare_conditions: null;
  fare_class: string;
  fare_restriction: null;
  flight_no: string;
  found_on: string;
  hiding_reason: null;
  id: string;
  infants_conditions: InfantsConditions;
  invalid: number;
  max_passengers_for_price: number;
  operating_airline: OperatingAirline;
  operating_flight_no: string;
  original_trip_id: string;
  passengers_flight_check: PassengersFlightCheck;
  price: number;
  price_id: string;
  refresh_period: number;
  refresh_ttl: number;
  refreshed: string;
  scraping_start: number;
  seats: number;
  source: string;
  source_name: string;
  source_url: string;
  src: string;
  src_country: string;
  src_name: string;
  src_station: string;
  src_terminal: null;
  timestamp: string;
  vehicle: Vehicle;
  return: number;
  is_self_transfer: boolean;
  bags_recheck_required: boolean;
  bags_recheck_disclaimer: string;
  segment_pricing: SegmentPricing;
  sector: number;
  forced_priority_boarding: boolean;
  local_arrival: string;
  utc_arrival: string;
  local_departure: string;
  utc_departure: string;
}

export interface Airline {
  Name: string;
  active: number;
  affil_url: null;
  airport_checkin: number;
  alliance: null;
  allowed_booking_window: null;
  book_fee: number;
  booking_doc_domestic: string;
  booking_doc_international: string;
  booking_doc_exceptions: any[];
  carrier_type: string;
  checkin: number;
  checkin_closure: number;
  close_booking_hours: number;
  code: string;
  code_public: string;
  country: string;
  deprecated: boolean;
  doing_online_checkin: number;
  fee_airline: number;
  fee_instead: number;
  fee_percent: number;
  fee_reason: string;
  fees_per_source: AdditionalServices;
  flight_change_fee: number;
  grade: string;
  iata: string;
  iata_code: string;
  iatacode: string;
  icao_code: string;
  id: number;
  is_passenger_cardholder: null;
  is_private_fares_allowed: null;
  lcc: null;
  luggage_only_during_checkin_airlines: null;
  luggage_only_on_web: null;
  maximum_passengers: number;
  mmb_link: null;
  name: string;
  non_active_reason: string;
  parent_carrier: string;
  passengers_in_search: number;
  payment_card_copy_eticket_requirement: boolean;
  search_priority: null;
  shorter_stopovers_allowed: number;
  skip_subairline_merge: null;
  temporary_disabled: null;
  threshold_adult: number;
  threshold_child: number;
  threshold_teen: null;
  url: string;
  virtual_card_req: boolean;
  hide_name: boolean;
  hand_length: null;
  hand_width: null;
  hand_height: null;
  hand_weight: null;
  hold_weight: number;
  hold_length: number;
  hold_width: number;
  hold_height: number;
  hand2_length: number;
  hand2_width: number;
  hand2_height: number;
  hand2_weight: number;
  hand2_note: string;
  hand_note: string;
  hold_note: string;
}

export interface CombinationPrice {
  segment_included_bags: SegmentIncludedBag[];
  price: number;
}

export interface SegmentIncludedBag {
  amount: number;
  concept: string;
}

export interface InfantsConditions {
  trolley: boolean;
  hand_weight: number;
}

export interface OperatingAirline {
  iata: string;
  name: string;
  public_code: string;
  hide_name: boolean;
}

export interface PassengersFlightCheck {
  '1': The1;
}

export interface The1 {
  eur: number;
  invalid: boolean;
  last_checked: number;
}

export interface SegmentPricing {
  adult: CurrentTicketsPriceSplit;
  child: CurrentTicketsPriceSplit;
  infant: CurrentTicketsPriceSplit;
}

export interface Vehicle {
  type: string;
}

export interface InsurancePrice {
  travel_basic: number;
  travel_plus: number;
}
