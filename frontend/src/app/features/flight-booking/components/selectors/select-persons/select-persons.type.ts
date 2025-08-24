export interface Persons {
  total: number;
  noOfInfants: number;
  noOfAdults: number;
  noOfTotalHandLuggage: number;
  noOfTotalHoldLuggage: number;
}

export enum BagsType {
  hand = 'Hand',
  hold = 'Hold',
}

export enum BagsQueryType {
  adult = 'Adult',
  children = 'Children',
}

export interface ISerializeResult {
  serialized: {
    adult: {
      handBags: string;
      holdBags: string;
    };
    children: {
      handBags: string;
      holdBags: string;
    };
  };
}
export interface IBagsExtendedOptions {
  handBagsSelected: number;
  holdBagsSelected: number;
}
export interface IBagsOptions {
  selectedAdults: number;
  selectedChildren: number;
  selectedInfants: number;
  bags: IBagsExtendedOptions;
}
