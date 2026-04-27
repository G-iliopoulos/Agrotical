# Agrotical — Commit 2
## data: add types & crop types to mockData

**Ημερομηνία:** 16 Ιανουαρίου 2026
**Hash:** b2d4f1a

### Τι προστέθηκε σε αυτό το commit:
- src/app/data/mockData.ts (ΝΕΟ αρχείο)

### Περιεχόμενο mockData.ts:
- TypeScript interfaces: User, CropType, Field, Task, Recommendation, WeatherData, SystemNotification
- Type aliases: UserRole, CareLevel, FieldStatus, TaskType, RecommendationPriority, RecommendationType
- 10 τύποι καλλιεργειών (cropTypes[]) με avgYieldPerAcre, avgPricePerKg, avgCostPerAcre
- Helper function: getCropById()

### Αρχεία από προηγούμενα commits (αμετάβλητα):
- src/app/App.tsx           (Commit 1)
- src/app/routes.tsx        (Commit 1)
- src/app/context/AuthContext.tsx (Commit 1)

### Σημείωση:
Τα users[], fields[], tasks[], recommendations[] και οι financial calculations
θα προστεθούν στο Commit 3.
