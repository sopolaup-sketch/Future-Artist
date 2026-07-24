import WidgetKit
import SwiftUI
import ActivityKit

public struct FutureArtistTrainingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var title: String
        public var modeName: String
        public var timerType: String
        public var currentActivity: String
        public var currentActivityProgress: String
        public var timeRemainingFormatted: String
        public var totalTimeFormatted: String
        public var progressPercent: Int
        public var expGained: Int
        public var coinsGained: Int
        public var nextRewardInfo: String
        public var todaysGoalProgress: String
        public var aiCoachQuote: String
        public var waterReminder: String
        public var levelInfo: String
        public var dailyMissionInfo: String
        public var streakDays: Int
        public var isPaused: Bool
        public var isFinished: Bool
    }
    
    public var appName: String
    public var icon: String
}

struct FutureArtistLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FutureArtistTrainingAttributes.self) { context in
            // Lock Screen UI
            VStack(alignment: .leading, spacing: 10) {
                // Header: Mode & Rewards
                HStack {
                    HStack(spacing: 4) {
                        Text(context.attributes.icon)
                        Text(context.state.modeName)
                            .font(.system(size: 13, weight: .black, design: .rounded))
                            .foregroundColor(.cyan)
                    }
                    Spacer()
                    HStack(spacing: 6) {
                        Text("+\(context.state.expGained) EXP")
                            .font(.system(size: 10, weight: .extrabold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.25))
                            .foregroundColor(.blue)
                            .cornerRadius(6)
                        
                        Text("+\(context.state.coinsGained) Coins")
                            .font(.system(size: 10, weight: .extrabold))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.amber.opacity(0.25))
                            .foregroundColor(.yellow)
                            .cornerRadius(6)
                    }
                }

                if context.state.isFinished {
                    // Training Complete View
                    VStack(spacing: 6) {
                        Text("🎉 Training Complete!")
                            .font(.system(size: 18, weight: .black, design: .rounded))
                            .foregroundColor(.green)
                        Text("Awesome Job! Excellent Performance!")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                } else {
                    // Current Activity Stage
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("CURRENT TRAINING")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(.gray)
                            Text(context.state.currentActivity)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.white)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("STAGE TIME")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(.gray)
                            Text(context.state.currentActivityProgress)
                                .font(.system(size: 13, weight: .bold, design: .monospaced))
                                .foregroundColor(.cyan)
                        }
                    }

                    // Main Timer Display
                    HStack(alignment: .lastTextBaseline) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("เหลือเวลาถอยหลัง")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                            HStack(spacing: 6) {
                                Text(context.state.timeRemainingFormatted)
                                    .font(.system(size: 26, weight: .black, design: .monospaced))
                                    .foregroundColor(.white)
                                Text("/ \(context.state.totalTimeFormatted)")
                                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    .foregroundColor(.gray)
                            }
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("\(context.state.progressPercent)%")
                                .font(.system(size: 16, weight: .black, design: .rounded))
                                .foregroundColor(.blue)
                            if context.state.isPaused {
                                Text("PAUSED")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.yellow)
                            }
                        }
                    }

                    // Progress Bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color.white.opacity(0.12))
                                .frame(height: 8)
                            RoundedRectangle(cornerRadius: 6)
                                .fill(LinearGradient(colors: [.blue, .purple, .cyan], startPoint: .leading, endPoint: .trailing))
                                .frame(width: max(0, min(geo.size.width * CGFloat(context.state.progressPercent) / 100.0, geo.size.width)), height: 8)
                        }
                    }
                    .frame(height: 8)

                    // Footer Badges: AI Coach / Water Break / Next Reward
                    HStack(spacing: 8) {
                        if !context.state.waterReminder.isEmpty {
                            HStack(spacing: 3) {
                                Text("💧")
                                Text(context.state.waterReminder)
                                    .font(.system(size: 10, weight: .bold))
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.cyan.opacity(0.2))
                            .foregroundColor(.cyan)
                            .cornerRadius(8)
                        }

                        if !context.state.aiCoachQuote.isEmpty {
                            HStack(spacing: 3) {
                                Text("🤖")
                                Text(context.state.aiCoachQuote)
                                    .font(.system(size: 10, weight: .bold))
                                    .lineLimit(1)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.purple.opacity(0.2))
                            .foregroundColor(.purple)
                            .cornerRadius(8)
                        }

                        Spacer()

                        if context.state.streakDays > 0 {
                            HStack(spacing: 2) {
                                Text("🔥")
                                Text("\(context.state.streakDays)d")
                                    .font(.system(size: 10, weight: .bold))
                            }
                            .foregroundColor(.orange)
                        }
                    }
                }
            }
            .padding(16)
            .background(Color(red: 13/255, green: 15/255, blue: 18/255))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Text(context.attributes.icon)
                            .font(.title3)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(context.state.modeName)
                                .font(.system(size: 11, weight: .black))
                                .foregroundColor(.cyan)
                            Text(context.state.currentActivity)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 1) {
                        Text("+\(context.state.expGained) EXP")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.blue)
                        Text("🔥 \(context.state.streakDays) วัน")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(.orange)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 4) {
                        HStack {
                            Text("เหลือเวลา: \(context.state.timeRemainingFormatted)")
                                .font(.system(size: 16, weight: .black, design: .monospaced))
                                .foregroundColor(.white)
                            Spacer()
                            Text("\(context.state.progressPercent)%")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.cyan)
                        }
                        if !context.state.aiCoachQuote.isEmpty {
                            Text("🤖 AI Coach: \(context.state.aiCoachQuote)")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.purple)
                                .lineLimit(1)
                        }
                    }
                }
            } compactLeading: {
                Text("\(context.attributes.icon) \(context.state.modeName)")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.cyan)
            } compactTrailing: {
                Text(context.state.timeRemainingFormatted)
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
            } minimal: {
                Text(context.attributes.icon)
                    .font(.caption)
            }
        }
    }
}
