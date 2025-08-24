export interface Languages {
    id?: string | number;
    isDefault: boolean;
    key: string;
    language: string;
    locale: string;
    flag: string,
    defaultCurrency: string,
    currency: {
        value: string,
        isDefault: boolean
    }[]
}[];

export interface Language {
    id?: string | number;
    isDefault: boolean;
    key: string;
    language: string;
    locale: string;
    flag: string;
    defaultCurrency: string;
    currency: {
        value: string,
        isDefault: boolean
    }[]
};
