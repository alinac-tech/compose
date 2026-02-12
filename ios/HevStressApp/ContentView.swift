import SwiftUI

struct ContentView: View {
    @EnvironmentObject var healthKitManager: HealthKitManager

    var body: some View {
        VStack(spacing: 24) {
            Text("HEV Stres Takibi")
                .font(.largeTitle)
                .bold()

            VStack(spacing: 8) {
                Text("Anlık stres seviyesi")
                    .font(.headline)
                Text("%\(healthKitManager.stressPercentage)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundStyle(colorForStress(healthKitManager.stressPercentage))
            }

            if let hrv = healthKitManager.latestHRV {
                Text(String(format: "Son HRV: %.1f ms", hrv))
                    .foregroundStyle(.secondary)
            } else {
                Text("HRV verisi bekleniyor")
                    .foregroundStyle(.secondary)
            }

            Text(healthKitManager.statusMessage)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button("Yenile") {
                healthKitManager.refreshStressLevel()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .task {
            await healthKitManager.requestAccessIfNeeded()
        }
    }

    private func colorForStress(_ value: Int) -> Color {
        switch value {
        case 0..<35:
            return .green
        case 35..<70:
            return .orange
        default:
            return .red
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(HealthKitManager())
}
