import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Award, Coins, Check, ArrowRight, Star, ShieldCheck, Crown } from "lucide-react";
import { getLevelTitle } from "../hooks/useAppState";
import { playChime } from "../utils/audio";

interface LevelUpModalProps {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  totalCoinsEarned: number;
  bonusXpEarned: number;
  unlockedFeatures: string[];
  badgeEarned?: string;
  frameEarned?: string;
  onClose: () => void;
}

export default function LevelUpModal({
  show,
  oldLevel,
  newLevel,
  totalCoinsEarned,
  bonusXpEarned,
  unlockedFeatures,
  badgeEarned,
  frameEarned,
  onClose
}: LevelUpModalProps) {
  useEffect(() => {
    if (show) {
      playChime("complete");
    }
  }, [show]);

  if (!show) return null;

  const isMilestone5 = newLevel % 5 === 0;
  const isMilestone10 = newLevel % 10 === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Confetti / Particle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/40 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-amber-500/20 overflow-hidden text-center"
        >
          {/* Glowing Top Banner */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Level Up Badge Icon */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-3xl rotate-6 blur-md opacity-70 animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 rounded-3xl p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-gray-950 rounded-[22px] flex flex-col items-center justify-center border border-amber-300/40">
                <Crown size={32} className="text-amber-400 animate-bounce" />
                <span className="font-display font-black text-xs text-amber-300 tracking-wider uppercase mt-1">LVL {newLevel}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-widest uppercase mb-1">
              <Sparkles size={14} className="text-amber-400 animate-spin" />
              🎉 LEVEL UP!
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              Level {oldLevel} <span className="text-amber-400">→</span> Level {newLevel}
            </h2>
            <p className="text-sm font-semibold text-amber-300/90">
              {getLevelTitle(newLevel)}
            </p>
          </motion.div>

          {/* Coins & XP Rewards Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 my-6"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Coins size={20} />
                <span className="font-mono font-black text-xl text-white">+{totalCoinsEarned}</span>
              </div>
              <span className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wide">Coins Earned</span>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                <Star size={20} />
                <span className="font-mono font-black text-xl text-white">+{bonusXpEarned > 0 ? bonusXpEarned : newLevel * 20}</span>
              </div>
              <span className="text-[11px] font-bold text-purple-300/80 uppercase tracking-wide">Bonus XP</span>
            </div>
          </motion.div>

          {/* Milestone Badges & Frames */}
          {(badgeEarned || frameEarned || isMilestone5 || isMilestone10) && (
            <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-yellow-400/40 rounded-2xl flex items-center gap-3 text-left">
              <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-xl shrink-0">
                <Trophy size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black text-yellow-300 uppercase tracking-wide">Milestone Reward Unlocked!</p>
                <p className="text-xs text-white font-medium">
                  {badgeEarned ? `ได้รับ Badge: ${badgeEarned} ` : ""}
                  {frameEarned ? `• กรอบโปรไฟล์: ${frameEarned}` : ""}
                  {!badgeEarned && !frameEarned && `รับโบนัสพิเศษฉลองพัฒนาการ Level ${newLevel}!`}
                </p>
              </div>
            </div>
          )}

          {/* Unlocked Features List */}
          <div className="space-y-2 mb-6 text-left">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              สิ่งที่ปลดล็อกใหม่ในเลเวลนี้ (Unlocked Features):
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {unlockedFeatures.length > 0 ? (
                unlockedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white">
                    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Check size={12} />
                    </div>
                    <span className="font-medium">{feat}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-gray-300">
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span>ยกระดับขีดความสามารถศิลปิน เพิ่ม XP สะสม และปลดล็อกสิทธิพิเศษ!</span>
                </div>
              )}
            </div>
          </div>

          {/* Claim Action Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-gray-950 font-black text-sm rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>รับของขวัญ & ลุยต่อ! (Claim & Continue)</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
