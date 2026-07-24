import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Coins,
  Clock,
  MinusCircle,
  Zap,
  Ticket,
  Package,
  Sparkles,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Gift,
  Check,
  Snowflake,
  HeartPulse,
  Crown,
  Lock,
  ArrowRight,
  Info
} from "lucide-react";
import { UserProfile } from "../types";
import {
  ShopItem,
  TIME_SHOP_ITEMS,
  REDUCE_TIME_ITEMS,
  BUFF_SHOP_ITEMS,
  PASS_SHOP_ITEMS,
  MYSTERY_BOX_ITEMS,
  getFinalItemPrice
} from "../data/shopData";

interface ShopViewProps {
  profile: UserProfile;
  buyShopItem: (item: ShopItem) => { success: boolean; message: string };
  openMysteryBox: (boxId: string) => { success: boolean; rewardTitle: string; rewardDesc: string };
  useInventoryItem: (itemId: string) => { success: boolean; message: string };
  getMissedDaysStraight: () => number;
  isHardWorkerToday: () => boolean;
}

export default function ShopView({
  profile,
  buyShopItem,
  openMysteryBox,
  useInventoryItem,
  getMissedDaysStraight,
  isHardWorkerToday
}: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<"time" | "reduce" | "buff" | "pass" | "mystery" | "inventory">("time");
  const [selectedItemForConfirm, setSelectedItemForConfirm] = useState<ShopItem | null>(null);
  const [unboxingResult, setUnboxingResult] = useState<{ title: string; desc: string } | null>(null);

  const missedDays = getMissedDaysStraight();
  const hardWorker = isHardWorkerToday();
  const currentCoins = profile.coins ?? 0;

  // Inventory count calculation
  const totalInventoryCount = Object.values(profile.inventory || {}).reduce((acc, curr) => acc + (curr || 0), 0);

  const handleBuyClick = (item: ShopItem) => {
    // If high-value item (> 50,000 coins), show confirmation modal
    const { finalPrice } = getFinalItemPrice(item, hardWorker, missedDays);
    if (finalPrice >= 50000 || item.id.includes("skip")) {
      setSelectedItemForConfirm(item);
    } else {
      buyShopItem(item);
    }
  };

  const handleConfirmBuy = () => {
    if (selectedItemForConfirm) {
      buyShopItem(selectedItemForConfirm);
      setSelectedItemForConfirm(null);
    }
  };

  const handleUnbox = (boxId: string) => {
    const res = openMysteryBox(boxId);
    if (res.success) {
      setUnboxingResult({ title: res.rewardTitle, desc: res.rewardDesc });
    }
  };

  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Clock": return <Clock className={className} />;
      case "Zap": return <Zap className={className} />;
      case "MinusCircle": return <MinusCircle className={className} />;
      case "AlertTriangle": return <AlertTriangle className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "TrendingUp": return <Sparkles className={className} />;
      case "Coins": return <Coins className={className} />;
      case "Gift": return <Gift className={className} />;
      case "Star": return <Sparkles className={className} />;
      case "Crown": return <Crown className={className} />;
      case "HeartPulse": return <HeartPulse className={className} />;
      case "ShieldAlert": return <ShieldAlert className={className} />;
      case "Snowflake": return <Snowflake className={className} />;
      case "Package": return <Package className={className} />;
      default: return <Package className={className} />;
    }
  };

  const renderCategoryItems = (items: ShopItem[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const { finalPrice, discountPercent, penaltyMultiplier } = getFinalItemPrice(item, hardWorker, missedDays);
          const canAfford = currentCoins >= finalPrice;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              className={`relative bg-[#12131e]/90 border rounded-2xl p-5 flex flex-col justify-between overflow-hidden backdrop-blur-xl transition-all shadow-lg ${
                canAfford ? "border-white/10 hover:border-purple-500/40" : "border-white/5 opacity-80"
              }`}
            >
              {/* Background gradient glow */}
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none bg-gradient-to-br ${item.color}`} />

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${item.color}`}>
                      {renderIcon(item.iconName, "w-5 h-5")}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">{item.name}</h3>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4 min-h-[36px]">
                  {item.description}
                </p>
              </div>

              {/* Price and buy action footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 font-mono font-black text-sm text-yellow-400">
                    <Coins size={15} className="text-yellow-400 fill-yellow-400/20" />
                    <span>{finalPrice.toLocaleString()} Coins</span>
                  </div>

                  {/* Discount or penalty label */}
                  {discountPercent > 0 && (
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Sparkles size={10} />
                      <span>ลด 20% (Hard Worker)</span>
                    </p>
                  )}
                  {penaltyMultiplier > 1 && (
                    <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={10} />
                      <span>ค่าปรับความขี้เกียจ x{penaltyMultiplier}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleBuyClick(item)}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    canAfford
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 hover:brightness-110 active:scale-95 shadow-amber-500/20"
                      : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                  }`}
                >
                  {canAfford ? (
                    <>
                      <span>ซื้อทันที</span>
                      <ArrowRight size={13} />
                    </>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>Coins ไม่พอ</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="shop-view-root" className="space-y-6 animate-fade-in pb-12 font-sans text-gray-100">
      
      {/* 1. Header Banner & Philosophy */}
      <div className="relative bg-gradient-to-br from-[#131326] via-[#1a142e] to-[#0d0d1a] border border-amber-500/20 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <ShoppingBag size={20} />
              </span>
              <h1 className="font-display font-black text-xl md:text-2xl text-white tracking-tight">
                ร้านค้าพัฒนาตนเอง (Reward & Penalty Shop)
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-300 italic font-medium leading-relaxed">
              “อยากเก่งขึ้น? จ่ายนิดเดียว — อยากขี้เกียจ? จ่ายแพงมาก!”
            </p>
            <p className="text-xs text-gray-400">
              ระบบส่งเสริมระเบียบวินัย: เพิ่มเวลาซ้อมราคาย่อมเยา เข้าถึงง่าย
              แต่การลดเวลาซ้อมหรือข้ามการฝึกจะมีราคาสูงมากเพื่อดัดความขี้เกียจ!
            </p>
          </div>

          {/* User Coins & Status Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">เหรียญของคุณ:</span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Level {profile.level}
              </span>
            </div>

            <div className="flex items-center gap-2 font-display font-black text-2xl text-yellow-400">
              <Coins size={26} className="text-yellow-400 fill-yellow-400/20 animate-pulse" />
              <span>{currentCoins.toLocaleString()}</span>
              <span className="text-xs font-normal text-gray-400">Coins</span>
            </div>

            {/* Hard Worker & Laziness Penalty Badges */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              {hardWorker ? (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                  <Sparkles size={13} className="shrink-0" />
                  <span>Hard Worker Active! (-20% Time Shop)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl">
                  <Info size={13} className="shrink-0" />
                  <span>ซ้อมให้ครบวันนี้เพื่อรับส่วนลด 20%</span>
                </div>
              )}

              {missedDays > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>ไม่ได้ซ้อม {missedDays} วันติด (ราคาลดเวลา x{missedDays >= 14 ? 5 : missedDays >= 7 ? 2 : 1.5})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "time", label: "Time Shop (+เวลา)", icon: Clock, badge: "ราคาถูก" },
          { id: "reduce", label: "Reduce Time (-เวลา)", icon: MinusCircle, badge: "แพงมาก!" },
          { id: "buff", label: "Shop Buff (เพิ่มคูณ)", icon: Zap },
          { id: "pass", label: "Special Pass & Freeze", icon: Ticket },
          { id: "mystery", label: "Mystery Box (กล่องสุ่ม)", icon: Gift },
          { id: "inventory", label: `My Inventory (${totalInventoryCount})`, icon: Package }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-gray-950 shadow-lg shadow-white/10 scale-105"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  tab.id === "reduce" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Render Active Shop Category Content */}
      <AnimatePresence mode="wait">
        {activeTab === "time" && (
          <motion.div key="time" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>ยิ่งอยากพัฒนาตัวเอง ยิ่งซื้อได้ง่าย! ราคาย่อมเยา เพิ่มเวลาเพื่อก้าวสู่ระดับมืออาชีพ</span>
              </div>
              {hardWorker && <span className="font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg">รับส่วนลด 20% แล้ว!</span>}
            </div>
            {renderCategoryItems(TIME_SHOP_ITEMS)}
          </motion.div>
        )}

        {activeTab === "reduce" && (
          <motion.div key="reduce" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-4 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-rose-400" />
              <span>
                ลดเวลาซ้อมได้ แต่ต้องคิดดี ๆ เพราะแพงกว่าการเพิ่มเวลาเป็นหลายร้อยเท่า! 
                หากไม่ซ้อมติดต่อกัน ราคาสินค้าจะทวีคูณ (3 วัน: +50%, 7 วัน: x2, 14 วัน: x5)
              </span>
            </div>
            {renderCategoryItems(REDUCE_TIME_ITEMS)}
          </motion.div>
        )}

        {activeTab === "buff" && (
          <motion.div key="buff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-4 text-xs text-purple-300 flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              <span>เพิ่มตัวคูณ EXP, Coins และรางวัลประจำวัน/สัปดาห์ เพื่อพัฒนาการก้าวกระโดด!</span>
            </div>
            {renderCategoryItems(BUFF_SHOP_ITEMS)}
          </motion.div>
        )}

        {activeTab === "pass" && (
          <motion.div key="pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 text-xs text-blue-300 flex items-center gap-2">
              <Ticket size={16} className="text-blue-400" />
              <span>บัตรคุ้มครองกรณีป่วย, แช่แข็ง Streak และบัตรข้ามวัน/สัปดาห์/เดือน</span>
            </div>
            {renderCategoryItems(PASS_SHOP_ITEMS)}
          </motion.div>
        )}

        {activeTab === "mystery" && (
          <motion.div key="mystery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 text-xs text-amber-300 flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              <span>เสี่ยงโชคลุ้นรับ Coins มหาศาล, EXP Bonus และ Ultimate Jackpot!</span>
            </div>
            {renderCategoryItems(MYSTERY_BOX_ITEMS)}
          </motion.div>
        )}

        {activeTab === "inventory" && (
          <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-[#12131e]/90 border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Package size={18} className="text-amber-400" />
                  <span>คลังไอเทมส่วนตัว (My Inventory)</span>
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  รวมทั้งหมด: {totalInventoryCount} ชิ้น
                </span>
              </div>

              {totalInventoryCount === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package size={48} className="mx-auto text-gray-600 animate-bounce" />
                  <p className="text-sm text-gray-400">ยังไม่มีไอเทมในคลังของคุณ</p>
                  <p className="text-xs text-gray-500">เลือกซื้อไอเทม พาส หรือกล่องสุ่มจากร้านค้าได้เลย!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(profile.inventory || {}).map(([itemId, count]) => {
                    if (count <= 0) return null;
                    const isBox = itemId.startsWith("box-");

                    return (
                      <div
                        key={itemId}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {isBox ? <Gift size={20} /> : <Ticket size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{itemId.replace("-", " ").toUpperCase()}</h4>
                            <p className="text-xs text-amber-400 font-mono font-semibold">
                              คงเหลือ: {count} ชิ้น
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (isBox) handleUnbox(itemId);
                            else useInventoryItem(itemId);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                          {isBox ? "เปิดกล่อง" : "ใช้งาน"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Confirmation Purchase Modal for High-Value Items */}
      {selectedItemForConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#181928] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">ยืนยันการทำรายการ</h3>
                <p className="text-xs text-gray-400">โปรดตรวจสอบก่อนดำเนินการซื้อ</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="font-bold text-sm text-amber-300">{selectedItemForConfirm.name}</p>
              <p className="text-xs text-gray-300">{selectedItemForConfirm.description}</p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">ราคาสุทธิ:</span>
                <span className="font-mono font-bold text-yellow-400 text-sm">
                  {getFinalItemPrice(selectedItemForConfirm, hardWorker, missedDays).finalPrice.toLocaleString()} Coins
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItemForConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmBuy}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                ยืนยันการสั่งซื้อ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. Unboxing Mystery Box Result Overlay */}
      {unboxingResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-[#1e1c38] to-[#121124] border border-amber-500/40 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/30 animate-bounce">
                <Gift size={40} />
              </div>

              <h3 className="font-display font-black text-xl text-white tracking-tight">
                {unboxingResult.title}
              </h3>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-200 font-medium whitespace-pre-line leading-relaxed">
                {unboxingResult.desc}
              </div>

              <button
                onClick={() => setUnboxingResult(null)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-amber-500/20"
              >
                รับของรางวัล!
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
