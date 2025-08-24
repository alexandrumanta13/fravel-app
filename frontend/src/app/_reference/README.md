# Legacy Code Reference

Această secțiune conține codul legacy care a fost eliminat din proiectul activ dar păstrat ca referință pentru dezvoltarea viitoare.

## 📁 Structura

### `kiwi-legacy/`
Codul original pentru integrarea cu Kiwi.com API (Tequila API):
- **Motivul eliminării**: Kiwi a întrerupt serviciile B2B
- **Conținut util**: Logica de formatare a datelor de zbor, procesarea rutelor, conversii de timp
- **Status**: Inactiv, doar pentru referință

## 🔍 Cum să folosești acest cod

### Pentru TravelFusion:
1. **Logica de procesare**: Inspiră-te din `kiwi.service.ts` pentru:
   - Formatarea răspunsurilor API
   - Procesarea rutelor de zbor
   - Calculele de timp și durată
   - Filtrarea zborurilor disponibile

2. **Tipuri de date**: Folosește `kiwi-search-flights.type.ts` ca model pentru:
   - Structura răspunsurilor
   - Interfețele pentru rute
   - Tipurile pentru parametrii de căutare

### Exemple de logică reutilizabilă:
- `filterAvailableFlights()` - filtrare bazată pe locuri disponibile
- `processRoutes()` - procesarea rutelor cu escale
- `createDepartureArrival()` - structurarea datelor plecare/sosire
- `convertISOTimeStringFrvl()` - conversii de timp

## ⚠️ Important
- **NU importa** aceste fișiere în codul activ
- **NU modifica** aceste fișiere - sunt frozen ca referință
- Adaptează logica pentru structura TravelFusion API

## 📅 Planul de eliminare
Aceste fișiere vor fi eliminate complet după ce:
- [ ] TravelFusion API este complet implementat
- [ ] Logica de formatare este adaptată și testată
- [ ] Nu mai e nevoie de referința Kiwi

---
*Ultima actualizare: ${new Date().toLocaleDateString()}*