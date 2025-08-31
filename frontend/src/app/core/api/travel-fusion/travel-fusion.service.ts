import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SharedService } from "src/app/shared/shared.service";
import { ConverDateUtils } from 'src/app/core/utils/convert-date-utils.service';
import { GenericRequest, CommandList } from './models/commandList.type';
import { XMLBuilder } from 'fast-xml-parser';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TravelFusionService {
    headers = new HttpHeaders({
        accept: 'text/xml',
        'Content-Type': 'text/xml',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    });

    constructor(
        private _SharedService: SharedService,
        private _ConverDateUtils: ConverDateUtils,
        private http: HttpClient
    ) { }

    async searchFlights() {
        try {
            const {
                departureCity,
                destinationCity,
                dateFromSubstract,
                dateToAdd,
                returnDateFromSubstract,
                returnDateToAdd,
                infoSerializedOptionsPersons,
                cabinClass,
                infoSerialized,
                defaultLanguage,
                isFlightTypeOneWay,
            } = this._SharedService.flightSearch();

            const request: GenericRequest = {
                CommandList: {
                    StartRouting: {
                        XmlLoginId: environment.travelFusionLoginId,
                        LoginId: environment.travelFusionLoginId,
                        Mode: 'plane',
                        Origin: {
                            Descriptor: departureCity.id,
                            Type: 'airportcode',
                        },
                        Destination: {
                            Descriptor: destinationCity.id,
                            Type: 'airportcode',
                        },
                        OutwardDates: {
                            DateOfSearch: this._ConverDateUtils.formatDatesForTravelFusionSearch(dateFromSubstract)
                        },
                        // ReturnDates: {
                        //     DateOfSearch: ''
                        // }
                        MaxChanges: 1,
                        MaxHops: 2,
                        Timeout: 40,
                        TravellerList: { Traveller: [{ Age: 30 }] },
                        IncrementalResults: true,
                        Language: defaultLanguage || 'en',
                        Currency: 'RON'
                    }
                }
            }

            console.log(request);

            const a = new XMLBuilder();
            const xml = a.build(request);

            console.log(xml);

            const fligts = await firstValueFrom(
                this.http.post<any>("https://api.travelfusion.com", xml, { headers: this.headers })
            )

            console.log(fligts);
        }
        catch (err) {
            console.error(err);
            // TODO: implement error message service
        }
    }
}