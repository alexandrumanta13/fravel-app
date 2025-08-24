export interface AppRoutes {
    id?: string | number;
    route: string;
    translate_route: {
        url: string;
        language_key: string;
    }[]
}[];

export interface CurrentRoute {
    language_key: string,
    url: string
}