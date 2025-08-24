import { Origin, Destination } from "./location.type";
import { OutwardDates, ReturnDates } from "./flightDates.type";
import { TravelerList } from "./travelers.type";

export interface StartRoutingRequest {
    XmlLoginId: string;
    LoginId: string;
    // This should be default set to plane.
    Mode: string;
    Origin: Origin;
    Destination: Destination;
    OutwardDates: OutwardDates;
    ReturnDates?: ReturnDates;
    // TO DO: treat multi-bound or open-jaw itineraries.
    AdditionalTripList?: any;
    MaxChanges: number;
    MaxHops: number;
    Timeout: number;
    TravellerList: TravelerList;
    // Required and must be true.
    IncrementalResults: boolean;
}

export interface BlaRequest {
    Age: number;
}