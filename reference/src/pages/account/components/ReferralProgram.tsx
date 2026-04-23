import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getOrCreateReferralCode,
  buildReferralUrl,
  getReferralsByCode,
  getTotalReferralBonusPoints,
  seedDemoReferrals,
  REFERRAL_BONUS_POINTS,
  REFEREE_FIRST_ORDER_DISCOUNT,
  type ReferralEntry,
} from '../../../utils/referralProgram';

export default function ReferralProgram() {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');

  useEffect(() => {
    if (!currentUser?.email) return;
    const code = getOrCreateReferralCode(currentUser.email);
    seedDemoReferrals(code);
    const url = buildReferralUrl(code);
    setReferralCode(code);
    setReferralUrl(url);
    setReferrals(getReferralsByCode(code));
  }, [currentUser?.email]);

  const totalBonusPoints = useMemo(
    () => getTotalReferralBonusPoints(referralCode),
    [referralCode, referrals]
  );
  const creditedCount = referrals.filter((r) => r.status === 'credited').length;
  const pendingCount = referrals.filter((r) => r.status === 'pending').length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = referralUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Get custom blinds from Classic Same Day Blinds!');
    const body = encodeURIComponent(
      `Hey! I\'ve been using Classic Same Day Blinds for custom window treatments and they\'re great.\n\nUse my referral link to get ${REFEREE_FIRST_ORDER_DISCOUNT}% off your first order:\n${referralUrl}\n\nYou\'ll love the quality and same-day service!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Use my referral link to get ${REFEREE_FIRST_ORDER_DISCOUNT}% off your first Classic Same Day Blinds order: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(
      `Get ${REFEREE_FIRST_ORDER_DISCOUNT}% off your first Classic Same Day Blinds order! Use my link: ${referralUrl}`
    );
    window.open(`sms:?body=${text}`, '_blank');
  };

  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
                <i className="ri-user-add-line text-white text-base"></i>
              </div>
              <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">Refer &amp; Earn</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Share the savings,<br />earn the rewards</h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-md">
              For every friend who places their first order using your link, you earn{' '}
              <strong className="text-white">{REFERRAL_BONUS_POINTS.toLocaleString()} bonus points</strong> ($
              {(REFERRAL_BONUS_POINTS / 100).toFixed(0)} value). Your friend gets{' '}
              <strong className="text-white">{REFEREE_FIRST_ORDER_DISCOUNT}% off</strong> their first order too!
            </p>
          </div>
          <div className="shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-4xl font-bold text-white">{creditedCount}</p>
            <p className="text-emerald-100 text-sm mt-1">Successful<br />Referrals</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-2xl font-bold text-yellow-300">{totalBonusPoints.toLocaleString()}</p>
              <p className="text-emerald-100 text-xs mt-0.5">Bonus pts earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: 'ri-links-line', label: 'Friends Referred', value: creditedCount.toString(), color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { icon: 'ri-copper-coin-line', label: 'Bonus Pts Earned', value: totalBonusPoints.toLocaleString(), color: 'bg-amber-50 text-amber-600 border-amber-100' },
          { icon: 'ri-time-line', label: 'Pending', value: pendingCount.toString(), color: 'bg-gray-50 text-gray-500 border-gray-100' },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-5 flex items-center gap-4 ${stat.color}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/70`}>
              <i className={`${stat.icon} text-2xl`}></i>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Link Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Your Unique Referral Link</h3>
        <p className="text-sm text-gray-500 mb-6">Share this link with friends and family — they get a discount, you earn points.</p>

        {/* Link display + copy */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
            <i className="ri-link-m text-gray-400 shrink-0"></i>
            <span className="text-sm font-mono text-gray-700 truncate">{referralUrl}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'}></i>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Referral code badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
            <i className="ri-fingerprint-line text-emerald-600 text-sm"></i>
            <span className="text-xs text-emerald-700 font-medium">Your code:</span>
            <span className="text-sm font-bold font-mono text-emerald-800 tracking-wider">{referralCode}</span>
          </div>
          <span className="text-xs text-gray-400">This code is permanently tied to your account</span>
        </div>

        {/* Share buttons */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Share via</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-whatsapp-line text-base"></i>
              WhatsApp
            </button>
            <button
              onClick={handleShareEmail}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-line text-base"></i>
              Email
            </button>
            <button
              onClick={handleShareSMS}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-message-2-line text-base"></i>
              SMS
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">How It Works</h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: 'ri-share-line',
              title: 'Share Your Link',
              desc: 'Copy your unique referral link and share it with friends, family, neighbors — anyone shopping for blinds or shades.',
              color: 'bg-emerald-50 text-emerald-600',
            },
            {
              step: '02',
              icon: 'ri-shopping-bag-3-line',
              title: 'Friend Places an Order',
              desc: `Your friend visits using your link and places their first order. They automatically receive ${REFEREE_FIRST_ORDER_DISCOUNT}% off as a welcome discount.`,
              color: 'bg-amber-50 text-amber-600',
            },
            {
              step: '03',
              icon: 'ri-copper-coin-line',
              title: 'You Earn 500 Points',
              desc: `Once their order is confirmed, ${REFERRAL_BONUS_POINTS.toLocaleString()} bonus points ($${(REFERRAL_BONUS_POINTS / 100).toFixed(0)} value) are added to your rewards balance instantly.`,
              color: 'bg-rose-50 text-rose-600',
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                <i className={`${item.icon} text-2xl`}></i>
              </div>
              <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-300">{item.step}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            <i className="ri-information-line mr-1"></i>
            Referral bonus applies only to a referred friend&apos;s <strong>first order</strong>. The friend must use your unique link before placing their order. Points are credited within 24 hours of the order being confirmed. No limit on how many friends you can refer. Referral points follow the standard 12-month expiry policy.
          </p>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Referral History</h3>
          <span className="text-sm text-gray-500">
            <strong className="text-emerald-700">{creditedCount}</strong> successful · <strong className="text-gray-600">{pendingCount}</strong> pending
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-full mx-auto mb-4">
              <i className="ri-user-add-line text-3xl text-emerald-400"></i>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">No referrals yet</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Share your link above and your referral history will show up here once a friend places their first order.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 border transition-colors ${
                  entry.status === 'credited'
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-amber-50 border-amber-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  entry.status === 'credited' ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  <i className={`${entry.status === 'credited' ? 'ri-user-follow-line text-emerald-600' : 'ri-time-line text-amber-500'} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {entry.refereeHint ?? 'Friend'}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      entry.status === 'credited'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <i className={entry.status === 'credited' ? 'ri-check-line' : 'ri-time-line'}></i>
                      {entry.status === 'credited' ? 'Credited' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Order {entry.orderId} ·{' '}
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-bold ${entry.status === 'credited' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    +{entry.bonusPoints.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-gray-400">
                    ≈ ${(entry.bonusPoints / 100).toFixed(0)} value
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
