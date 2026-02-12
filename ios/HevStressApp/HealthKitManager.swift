import Foundation
import HealthKit

@MainActor
final class HealthKitManager: ObservableObject {
    @Published var stressPercentage: Int = 0
    @Published var latestHRV: Double?
    @Published var statusMessage: String = "Health uygulaması bağlantısı bekleniyor."

    private let healthStore = HKHealthStore()
    private var authorized = false

    func requestAccessIfNeeded() async {
        guard HKHealthStore.isHealthDataAvailable() else {
            statusMessage = "Bu cihaz HealthKit desteklemiyor."
            return
        }

        guard !authorized else {
            refreshStressLevel()
            return
        }

        guard let hrvType = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
            statusMessage = "HRV veri tipi bulunamadı."
            return
        }

        do {
            try await healthStore.requestAuthorization(toShare: [], read: [hrvType])
            authorized = true
            statusMessage = "Health uygulaması bağlantısı hazır."
            refreshStressLevel()
        } catch {
            statusMessage = "İzin alınamadı: \(error.localizedDescription)"
        }
    }

    func refreshStressLevel() {
        guard let hrvType = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
            statusMessage = "HRV veri tipi bulunamadı."
            return
        }

        let endDate = Date()
        let startDate = Calendar.current.date(byAdding: .minute, value: -5, to: endDate) ?? endDate
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        let query = HKSampleQuery(sampleType: hrvType, predicate: predicate, limit: 1, sortDescriptors: [sort]) { [weak self] _, samples, error in
            Task { @MainActor in
                guard let self else { return }

                if let error {
                    self.statusMessage = "Veri okunamadı: \(error.localizedDescription)"
                    return
                }

                guard let sample = samples?.first as? HKQuantitySample else {
                    self.latestHRV = nil
                    self.stressPercentage = 0
                    self.statusMessage = "Son 5 dakika içinde HRV verisi bulunamadı."
                    return
                }

                let unit = HKUnit.secondUnit(with: .milli)
                let hrv = sample.quantity.doubleValue(for: unit)
                self.latestHRV = hrv
                self.stressPercentage = Self.estimateStressFromHRV(hrv)
                self.statusMessage = "Veri güncellendi: \(DateFormatter.localizedString(from: sample.endDate, dateStyle: .none, timeStyle: .short))."
            }
        }

        healthStore.execute(query)
    }

    private static func estimateStressFromHRV(_ hrv: Double) -> Int {
        // Basit örnek eşleme:
        // 20 ms ve altı => 100 (yüksek stres)
        // 80 ms ve üstü => 0 (düşük stres)
        let clamped = max(20, min(80, hrv))
        let normalized = 1 - ((clamped - 20) / 60)
        return Int((normalized * 100).rounded())
    }
}
