# HEV Stress iOS Prototype

Bu repo, iOS telefonlarda **Health (HealthKit)** verisini kullanarak anlık stres seviyesini gösteren örnek bir SwiftUI uygulama iskeleti içerir.

## Neler yapar?
- HealthKit üzerinden `heartRateVariabilitySDNN` (HRV) verisini okur.
- Son 5 dakikadaki en güncel HRV ölçümünü alır.
- HRV değerini basit bir ölçekle `%0-%100` stres seviyesine çevirir.
- Ekranda renk kodlu anlık stres durumunu gösterir.

## Dosya yapısı
- `ios/HevStressApp/HevStressApp.swift`: App entry point.
- `ios/HevStressApp/ContentView.swift`: Ana ekran.
- `ios/HevStressApp/HealthKitManager.swift`: HealthKit izin ve veri çekme mantığı.

## Çalıştırma
1. Xcode'da bir iOS SwiftUI projesi oluşturun veya bu dosyaları mevcut projeye ekleyin.
2. `Signing & Capabilities` kısmından **HealthKit** capability ekleyin.
3. `Info.plist` içine Health verisi açıklamalarını ekleyin.
4. Gerçek bir iPhone üzerinde çalıştırın (simülatörde Health verisi sınırlı olabilir).

> Not: Buradaki stres hesaplaması tıbbi bir ölçüm değildir; demo amaçlı basit bir dönüşümdür.
