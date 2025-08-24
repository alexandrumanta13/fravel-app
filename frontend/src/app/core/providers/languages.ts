export const languages = [
  {
    id: 1,
    defaultCurrency: 'RON',
    flag: 'assets/images/flags/ro.svg',
    isDefault: true,
    key: 'ro',
    language: 'Romana',
    locale: 'ro-RO',
    currency: [
      {
        id: 1,
        isDefault: true,
        value: 'RON',
      },
      {
        id: 2,
        isDefault: false,
        value: 'EUR',
      },
      {
        id: 3,
        isDefault: false,
        value: 'GBP',
      },
      {
        id: 4,
        isDefault: false,
        value: 'USD',
      },
    ],
  },
  {
    id: 2,
    defaultCurrency: 'EUR',
    flag: 'assets/images/flags/en.svg',
    isDefault: false,
    key: 'en',
    language: 'English',
    locale: 'en-US',
    currency: [
      {
        id: 1,
        isDefault: false,
        value: 'RON',
      },
      {
        id: 2,
        isDefault: true,
        value: 'EUR',
      },
      {
        id: 3,
        isDefault: false,
        value: 'GBP',
      },
      {
        id: 4,
        isDefault: false,
        value: 'USD',
      },
    ],
  },
];
