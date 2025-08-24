export interface FlightDate {
    // Required format for all dates: dd/mm/yyyy-hh:mm
    DateOfSearch: string;
    DepartDateFilter?: string;
    DiscardBefore?: string;
    DiscardAfter?: string;
}

export interface OutwardDates extends FlightDate {

}

export interface ReturnDates extends FlightDate {
    
}