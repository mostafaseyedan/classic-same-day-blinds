import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { mockOrders } from '../../../mocks/orders';
import {
  calculatePointsFromOrders,
  buildPointsHistory,
  getTier,
  getNextTier,
  getTierProgress,
  redeemReward,
  getRedeemedHistory,
  getSpentPoints,
  getExpiringSoonPoints,
  REWARDS,
  TIERS,
  EXPIRY_WARNING_DAYS,
  type PointsHistoryEntry,
  type RedeemedItem,
} from '../../../utils/loyaltyPoints';
import {
  getOrCreateReferralCode,
  getTotalReferralBonusPoints,
} from '../../../utils/referralProgram';

const tierMultipliers = [
  { nameEn: 'Bronze',   multiplier: 1,    icon: 'ri-medal-line',       color: 'bg-amber-100 text-amber-800 border-amber-300',    active: 'bg-amber-600 text-white border-amber-600' },
  { nameEn: 'Silver',   multiplier: 1.25, icon: 'ri-medal-2-line',     color: 'bg-slate-100 text-slate-700 border-slate-300',    active: 'bg-slate-600 text-white border-slate-600' },
  { nameEn: 'Gold',     multiplier: 1.5,  icon: 'ri-vip-crown-line',   color: 'bg-yellow-100 text-yellow-800 border-yellow-300', active: 'bg-yellow-500 text-white border-yellow-500' },
  { nameEn: 'Platinum', multiplier: 2,    icon: 'ri-vip-diamond-line', color: 'bg-violet-100 text-violet-800 border-violet-300', active: 'bg-violet-600 text-white border-violet-600' },
];

export default function LoyaltyRewards() {
  const { currentUser } = useAuth();
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedItem[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [justRedeemed, setJustRedeemed] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'redeem' | 'history' | 'how' | 'calculator'>('redeem');
  const [orderAmount, setOrderAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState(0);

  const allOrders = useMemo(() => {
    try {
      const stored: { id: string; total: number; date: string }[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      const storedIds = new Set(stored.map((o) => o.id));
      const filtered = mockOrders.filter((o) => !storedIds.has(o.id));
      return [...stored, ...filtered] as { id: string; total: number; date: string }[];
    } catch {
      return mockOrders as { id: string; total: number; date: string }[];
    }
  }, []);

  const referralBonusPoints = useMemo(() => {
    if (!currentUser?.email) return 0;
    const code = getOrCreateReferralCode(currentUser.email);
    return getTotalReferralBonusPoints(code);
  }, [currentUser?.email]);

  const earnedPoints = calculatePointsFromOrders(allOrders);
  const spentPoints = getSpentPoints();
  const availablePoints = Math.max(0, earnedPoints + referralBonusPoints - spentPoints);
  const expiringSoonPoints = getExpiringSoonPoints(allOrders);
  const currentTier = getTier(earnedPoints + referralBonusPoints);
  const nextTier = getNextTier(earnedPoints + referralBonusPoints);
  const progress = getTierProgress(earnedPoints + referralBonusPoints);
  const pointsHistory: PointsHistoryEntry[] = buildPointsHistory(allOrders);

  const calcAmount = parseFloat(orderAmount.replace(/[^0-9.]/g, '')) || 0;
  const calcMultiplier = tierMultipliers[selectedTier].multiplier;
  const calcPoints = Math.floor(calcAmount * calcMultiplier);
  const calcDollarValue = (calcPoints * 0.1).toFixed(2);
  const calcReturnRate = calcAmount > 0 ? ((parseFloat(calcDollarValue) / calcAmount) * 100).toFixed(1) : '0';

  useEffect(() => {
    setRedeemedHistory(getRedeemedHistory());
  }, []);

  const handleRedeem = (rewardId: string) => {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward || availablePoints < reward.pointsCost) return;
    setRedeemingId(rewardId);
    setTimeout(() => {
      redeemReward(reward);
      setRedeemedHistory(getRedeemedHistory());
      setRedeemingId(null);
      setJustRedeemed(rewardId);
      setTimeout(() => setJustRedeemed(null), 3000);
    }, 700);
  };

  return (
    <div>
      {/* Expiring-soon banner */}
      {expiringSoonPoints > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4">
          <div className="w-9 h-9 flex items-center justify-center bg-amber-100 rounded-lg shrink-0">
            <i className="ri-alarm-warning-line text-amber-600 text-lg"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Points Expiring Soon</p>
            <p className="text-sm text-amber-700 mt-0.5">
              <strong>{expiringSoonPoints.toLocaleString()} pts</strong> will expire within {EXPIRY_WARNING_DAYS} days — redeem them before they're gone!
            </p>
          </div>
          <button
            onClick={() => setActiveSection('redeem')}
            className="shrink-0 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Redeem Now
          </button>
        </div>
      )}

      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className={`${currentTier.bgClass} border ${currentTier.borderClass} rounded-xl p-5 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: currentTier.color + '20' }}>
            <i className={`${currentTier.icon} text-2xl`} style={{ color: currentTier.color }}></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Tier</p>
            <p className="text-xl font-bold" style={{ color: currentTier.color }}>{currentTier.name}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-copper-coin-line text-2xl text-emerald-600"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Available Points</p>
            <p className="text-2xl font-bold text-emerald-700">{availablePoints.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">Active (12-mo window)</p>
            {referralBonusPoints > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <i className="ri-user-add-line text-xs"></i>
                +{referralBonusPoints.toLocaleString()} from referrals
              </p>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-star-line text-2xl text-gray-500"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Earned</p>
            <p className="text-2xl font-bold text-gray-900">{(earnedPoints + referralBonusPoints).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tier progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Tier Progress</h3>
          {nextTier ? (
            <span className="text-sm text-gray-500">
              <strong className="text-gray-900">{(nextTier.min - earnedPoints).toLocaleString()}</strong> pts to {nextTier.name}
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-600">Platinum — Maximum Tier Reached!</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, backgroundColor: currentTier.color }}
          ></div>
        </div>
        {/* Tier milestones */}
        <div className="flex justify-between">
          {TIERS.map((tier) => {
            const isActive = earnedPoints >= tier.min;
            return (
              <div key={tier.name} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    borderColor: isActive ? tier.color : '#E5E7EB',
                    backgroundColor: isActive ? tier.color + '20' : 'white',
                  }}
                >
                  <i className={`${tier.icon} text-sm`} style={{ color: isActive ? tier.color : '#9CA3AF' }}></i>
                </div>
                <span className="text-xs font-semibold" style={{ color: isActive ? tier.color : '#9CA3AF' }}>
                  {tier.name}
                </span>
                <span className="text-xs text-gray-400">{tier.min.toLocaleString()}+</span>
              </div>
            );
          })}
        </div>

        {/* Tier benefits */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-4 gap-3">
          {TIERS.map((tier) => {
            const isActive = currentTier.name === tier.name;
            return (
              <div
                key={tier.name}
                className={`rounded-lg p-3 border text-center transition-all ${
                  isActive ? `${tier.bgClass} ${tier.borderClass}` : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
              >
                <p className="text-xs font-bold mb-1" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-xs text-gray-600">{tier.multiplier}x points</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {([
          { id: 'redeem',     label: 'Redeem Points',   icon: 'ri-gift-line' },
          { id: 'history',    label: 'Earning History', icon: 'ri-history-line' },
          { id: 'how',        label: 'How It Works',    icon: 'ri-question-line' },
          { id: 'calculator', label: 'Calculator',      icon: 'ri-calculator-line' },
        ] as const).map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeSection === s.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className={s.icon}></i>
            {s.label}
          </button>
        ))}
      </div>

      {/* Redeem section */}
      {activeSection === 'redeem' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Available Rewards</h3>
            <span className="text-sm text-gray-500">You have <strong className="text-emerald-700">{availablePoints.toLocaleString()} pts</strong> to spend</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {REWARDS.map((reward) => {
              const canRedeem = availablePoints >= reward.pointsCost;
              const isRedeeming = redeemingId === reward.id;
              const wasRedeemed = justRedeemed === reward.id;
              return (
                <div
                  key={reward.id}
                  className={`bg-white border rounded-xl p-5 flex flex-col gap-3 transition-all ${
                    canRedeem ? 'border-gray-200 hover:border-emerald-200' : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${canRedeem ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                      <i className={`${reward.icon} text-xl ${canRedeem ? 'text-emerald-600' : 'text-gray-400'}`}></i>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${canRedeem ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {reward.pointsCost.toLocaleString()} pts
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{reward.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{reward.description}</p>
                    {reward.minOrder && (
                      <p className="text-xs text-amber-600 mt-1">Min. order ${reward.minOrder}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canRedeem || isRedeeming}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      wasRedeemed
                        ? 'bg-emerald-600 text-white'
                        : canRedeem
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isRedeeming ? (
                      <><i className="ri-loader-4-line animate-spin"></i> Redeeming...</>
                    ) : wasRedeemed ? (
                      <><i className="ri-check-line"></i> Redeemed!</>
                    ) : canRedeem ? (
                      <><i className="ri-gift-2-line"></i> Redeem Now</>
                    ) : (
                      <><i className="ri-lock-line"></i> Need {(reward.pointsCost - availablePoints).toLocaleString()} more pts</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Redemption history */}
          {redeemedHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-900 mb-4">Redeemed Rewards</h3>
              <div className="space-y-2">
                {redeemedHistory.map((item, idx) => {
                  const reward = REWARDS.find((r) => r.id === item.rewardId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg">
                          <i className={`${reward?.icon ?? 'ri-gift-line'} text-emerald-600 text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.rewardTitle}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-500">-{reward?.pointsCost.toLocaleString() ?? '?'} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History section */}
      {activeSection === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Points Earned Per Order</h3>
            <span className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{currentTier.multiplier}x</span> multiplier active ({currentTier.name} tier)
            </span>
          </div>
          <div className="mb-4 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-500">
            <i className="ri-time-line text-gray-400"></i>
            Points expire <strong className="text-gray-700">12 months</strong> after each order date. Expired points are shown for reference only.
          </div>
          {pointsHistory.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <i className="ri-history-line text-4xl text-gray-300 mb-3 block"></i>
              <p className="text-gray-500">No order history yet.</p>
              <Link to="/#products" className="mt-4 inline-block text-sm text-emerald-600 font-semibold hover:underline cursor-pointer">
                Start shopping to earn points
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pointsHistory.map((entry) => {
                const expiryStr = entry.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 border transition-colors ${
                      entry.isExpired
                        ? 'bg-gray-50 border-gray-100 opacity-60'
                        : entry.isExpiringSoon
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-gray-100 hover:border-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.isExpired ? 'bg-gray-100' : entry.isExpiringSoon ? 'bg-amber-100' : 'bg-emerald-50'
                      }`}>
                        <i className={`ri-shopping-bag-3-line text-lg ${
                          entry.isExpired ? 'text-gray-400' : entry.isExpiringSoon ? 'text-amber-500' : 'text-emerald-600'
                        }`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{entry.orderId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {' · '}Order total: <strong>${entry.orderTotal.toFixed(2)}</strong>
                        </p>
                        <p className={`text-xs mt-0.5 flex items-center gap-1 ${
                          entry.isExpired ? 'text-gray-400' : entry.isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-gray-400'
                        }`}>
                          <i className={`ri-time-line text-xs ${entry.isExpiringSoon && !entry.isExpired ? 'text-amber-500' : ''}`}></i>
                          {entry.isExpired ? `Expired ${expiryStr}` : `Expires ${expiryStr}${entry.isExpiringSoon ? ' — soon!' : ''}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${entry.isExpired ? 'text-gray-400 line-through' : entry.isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {entry.isExpired ? '' : '+'}{entry.pointsEarned.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* How it works section */}
      {activeSection === 'how' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">How the Rewards Program Works</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Shop & Earn', desc: 'For every $50 you spend, you earn $5 in rewards. Higher tiers earn bonus multipliers — up to 2x rewards for Platinum members.', icon: 'ri-shopping-cart-line', color: 'bg-emerald-50 text-emerald-600' },
              { step: '2', title: 'Reach New Tiers', desc: 'As your lifetime points grow, you unlock Silver, Gold, and Platinum status — each with higher earn multipliers and exclusive perks.', icon: 'ri-vip-crown-line', color: 'bg-amber-50 text-amber-600' },
              { step: '3', title: 'Redeem Rewards', desc: 'Trade your available points for discounts and savings. Redeemed rewards appear as promo codes at checkout.', icon: 'ri-gift-2-line', color: 'bg-rose-50 text-rose-600' },
            ].map((item) => (
              <div key={item.step} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <i className={`${item.icon} text-2xl`}></i>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Step {item.step}</p>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mt-4">
            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <i className="ri-information-line"></i>
              Points &amp; Tier Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-emerald-700">
              <div>
                <p className="font-semibold mb-1">Earning Rate</p>
                <p>Every $50 spent = $5 in rewards (500 pts)</p>
                <p>Silver: 1.25x · Gold: 1.5x · Platinum: 2x multiplier</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Tier Thresholds</p>
                <p>Bronze: 0–999 pts · Silver: 1,000–2,499 pts</p>
                <p>Gold: 2,500–4,999 pts · Platinum: 5,000+ pts</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <i className="ri-alarm-warning-line"></i>
              Points Expiry Policy
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Points expire <strong>12 months</strong> after the date of the order they were earned on. You&apos;ll see an expiry warning{' '}
              <strong>{EXPIRY_WARNING_DAYS} days</strong> before any points are due to expire. Make sure to redeem them in time!
            </p>
          </div>
        </div>
      )}

      {/* Calculator section */}
      {activeSection === 'calculator' && (
        <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-emerald-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-700 rounded-xl shrink-0">
                <i className="ri-calculator-line text-white text-base"></i>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Rewards Calculator</h3>
            </div>
            <p className="text-gray-500 text-sm ml-12">
              See exactly how many points you&apos;d earn on your next order before placing it.
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-2">
                    Order Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3.5 text-lg font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-2">
                    Your Membership Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {tierMultipliers.map((t, i) => (
                      <button
                        key={t.nameEn}
                        onClick={() => setSelectedTier(i)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedTier === i ? t.active : t.color
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <i className={`${t.icon} text-sm`}></i>
                        </div>
                        <span>{t.nameEn}</span>
                        <span className="ml-auto opacity-70">{t.multiplier}x</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-white rounded-2xl border border-emerald-100 p-6">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                  Your Estimated Rewards
                </p>

                <div className="flex items-end gap-3 mb-5">
                  <span className="text-5xl font-black text-gray-900 leading-none">{calcPoints.toLocaleString()}</span>
                  <span className="text-lg font-bold text-gray-400 mb-1">pts</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Dollar value</p>
                    <p className="text-xl font-extrabold text-emerald-700">${calcDollarValue}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Return rate</p>
                    <p className="text-xl font-extrabold text-amber-700">{calcReturnRate}%</p>
                  </div>
                </div>

                {/* Tier comparison */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Compare across tiers</p>
                  <div className="space-y-1.5">
                    {tierMultipliers.map((t, i) => {
                      const pts = Math.floor(calcAmount * t.multiplier);
                      const val = (pts * 0.1).toFixed(2);
                      const isSelected = i === selectedTier;
                      return (
                        <div
                          key={t.nameEn}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            isSelected ? 'bg-emerald-100' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              <i className={`${t.icon} text-xs text-gray-500`}></i>
                            </div>
                            <span className={`text-xs font-bold ${isSelected ? 'text-emerald-800' : 'text-gray-600'}`}>
                              {t.nameEn}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                              {pts.toLocaleString()} pts
                            </span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>
                              = ${val}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {calcAmount === 0 && (
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Enter an order amount above to see your rewards
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
