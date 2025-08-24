import { StartRoutingRequest, BlaRequest } from "./startRouting.type";

export interface GenericRequest {
    CommandList: CommandList;
}

export interface CommandList {
    StartRouting: StartRoutingRequest;
    Mizerie?: BlaRequest;
}