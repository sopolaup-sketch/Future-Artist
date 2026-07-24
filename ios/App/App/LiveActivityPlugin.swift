import Foundation
import Capacitor
import ActivityKit

@objc(LiveActivityPlugin)
public class LiveActivityPlugin: CAPPlugin {
    
    @objc func startLiveActivity(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            let title = call.getString("title") ?? "Future Artist Training"
            let modeName = call.getString("modeName") ?? "Artist Mode"
            let timerType = call.getString("timerType") ?? "Vocal Practice"
            let currentActivity = call.getString("currentActivity") ?? "🎤 Singing"
            let currentActivityProgress = call.getString("currentActivityProgress") ?? "00:00"
            let totalSeconds = call.getInt("totalSeconds") ?? 1800
            let remainingSeconds = call.getInt("remainingSeconds") ?? totalSeconds
            let expGained = call.getInt("expGained") ?? 250
            let coinsGained = call.getInt("coinsGained") ?? 150
            let nextRewardInfo = call.getString("nextRewardInfo") ?? "+50 Coins (10 นาที)"
            let todaysGoalProgress = call.getString("todaysGoalProgress") ?? "1:25 / 2:00"
            let aiCoachQuote = call.getString("aiCoachQuote") ?? "อีก 15 นาทีก็ได้พักแล้ว!"
            let waterReminder = call.getString("waterReminder") ?? ""
            let levelInfo = call.getString("levelInfo") ?? "LV 27"
            let dailyMissionInfo = call.getString("dailyMissionInfo") ?? "7/10 Complete"
            let streakDays = call.getInt("streakDays") ?? 29
            let icon = call.getString("icon") ?? "🎤"

            Task {
                for activity in Activity<FutureArtistTrainingAttributes>.activities {
                    await activity.end(dismissalPolicy: .immediate)
                }
                
                let attributes = FutureArtistTrainingAttributes(
                    appName: "Future Artist",
                    icon: icon
                )
                
                let percent = totalSeconds > 0 ? Int(Double(totalSeconds - remainingSeconds) / Double(totalSeconds) * 100) : 0
                let state = FutureArtistTrainingAttributes.ContentState(
                    title: title,
                    modeName: modeName,
                    timerType: timerType,
                    currentActivity: currentActivity,
                    currentActivityProgress: currentActivityProgress,
                    timeRemainingFormatted: formatTime(seconds: remainingSeconds),
                    totalTimeFormatted: formatTime(seconds: totalSeconds),
                    progressPercent: percent,
                    expGained: expGained,
                    coinsGained: coinsGained,
                    nextRewardInfo: nextRewardInfo,
                    todaysGoalProgress: todaysGoalProgress,
                    aiCoachQuote: aiCoachQuote,
                    waterReminder: waterReminder,
                    levelInfo: levelInfo,
                    dailyMissionInfo: dailyMissionInfo,
                    streakDays: streakDays,
                    isPaused: false,
                    isFinished: false
                )
                
                do {
                    let activity = try Activity.request(
                        attributes: attributes,
                        contentState: state,
                        pushType: nil
                    )
                    call.resolve([
                        "success": true,
                        "activityId": activity.id
                    ])
                } catch {
                    call.resolve([
                        "success": false,
                        "error": error.localizedDescription
                    ])
                }
            }
        } else {
            call.resolve(["success": false, "error": "Live Activities require iOS 16.1+"])
        }
    }

    @objc func updateLiveActivity(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            let remainingSeconds = call.getInt("remainingSeconds") ?? 0
            let totalSeconds = call.getInt("totalSeconds") ?? 1800
            let title = call.getString("title") ?? "Future Artist Training"
            let modeName = call.getString("modeName") ?? "Artist Mode"
            let timerType = call.getString("timerType") ?? "Vocal Practice"
            let currentActivity = call.getString("currentActivity") ?? "🎤 Singing"
            let currentActivityProgress = call.getString("currentActivityProgress") ?? "00:00"
            let expGained = call.getInt("expGained") ?? 250
            let coinsGained = call.getInt("coinsGained") ?? 150
            let nextRewardInfo = call.getString("nextRewardInfo") ?? "+50 Coins"
            let todaysGoalProgress = call.getString("todaysGoalProgress") ?? "1:25 / 2:00"
            let aiCoachQuote = call.getString("aiCoachQuote") ?? ""
            let waterReminder = call.getString("waterReminder") ?? ""
            let levelInfo = call.getString("levelInfo") ?? "LV 27"
            let dailyMissionInfo = call.getString("dailyMissionInfo") ?? "7/10 Complete"
            let streakDays = call.getInt("streakDays") ?? 29
            let isPaused = call.getBool("isPaused") ?? false
            let isFinished = call.getBool("isFinished") ?? false

            let percent = totalSeconds > 0 ? Int(Double(totalSeconds - remainingSeconds) / Double(totalSeconds) * 100) : 100
            let state = FutureArtistTrainingAttributes.ContentState(
                title: title,
                modeName: modeName,
                timerType: timerType,
                currentActivity: currentActivity,
                currentActivityProgress: currentActivityProgress,
                timeRemainingFormatted: formatTime(seconds: remainingSeconds),
                totalTimeFormatted: formatTime(seconds: totalSeconds),
                progressPercent: percent,
                expGained: expGained,
                coinsGained: coinsGained,
                nextRewardInfo: nextRewardInfo,
                todaysGoalProgress: todaysGoalProgress,
                aiCoachQuote: aiCoachQuote,
                waterReminder: waterReminder,
                levelInfo: levelInfo,
                dailyMissionInfo: dailyMissionInfo,
                streakDays: streakDays,
                isPaused: isPaused,
                isFinished: isFinished
            )

            Task {
                for activity in Activity<FutureArtistTrainingAttributes>.activities {
                    await activity.update(using: state)
                }
                call.resolve(["success": true])
            }
        } else {
            call.resolve(["success": false])
        }
    }

    @objc func pauseLiveActivity(_ call: CAPPluginCall) {
        updateLiveActivity(call)
    }

    @objc func resumeLiveActivity(_ call: CAPPluginCall) {
        updateLiveActivity(call)
    }

    @objc func stopLiveActivity(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<FutureArtistTrainingAttributes>.activities {
                    await activity.end(dismissalPolicy: .immediate)
                }
                call.resolve(["success": true])
            }
        } else {
            call.resolve(["success": false])
        }
    }

    private func formatTime(seconds: Int) -> String {
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60
        if h > 0 {
            return String(format: "%02d:%02d:%02d", h, m, s)
        } else {
            return String(format: "%02d:%02d", m, s)
        }
    }
}
