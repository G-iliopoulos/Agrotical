# Agrotical — Commit 3
## data: add users, fields, tasks, recommendations & financial calculations

**Ημερομηνία:** 17 Ιανουαρίου 2026
**Hash:** c3e5a2b

### Τι προστέθηκε σε αυτό το commit (mockData.ts ενημερώθηκε):
- users[]     → 7 mock users (1 admin, 4 farmers, 2 agronomists)
- fields[]    → 8 χωράφια με healthScore, irrigationType, soilType, imageUrl
- tasks[]     → 7 εργασίες με priorities και estimatedCost
- recommendations[] → 4 συστάσεις (pending/read/applied)
- weatherData[]     → 7ήμερη πρόγνωση καιρού
- systemNotifications[] → 3 ειδοποιήσεις συστήματος
- calculateFieldFinancials() → Υπολογισμός εσόδων/εξόδων/κέρδους
- getFarmerTotals() → Σύνολα ανά αγρότη
- getFieldsByFarmer(), getCropById(), getUserById() → Helpers
- monthlyProductionData, cropDistributionData → Δεδομένα γραφημάτων

### Αρχεία αμετάβλητα από Commit 1:
- src/app/App.tsx
- src/app/routes.tsx
- src/app/context/AuthContext.tsx
