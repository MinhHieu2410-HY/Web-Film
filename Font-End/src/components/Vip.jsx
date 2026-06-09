import React, { useState } from 'react';
import { Crown, Star, Check } from 'lucide-react';

const QR_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23ffffff'/><rect x='10' y='10' width='60' height='60' rx='4' fill='none' stroke='%23000' stroke-width='6'/><rect x='22' y='22' width='36' height='36' rx='2' fill='%23000'/><rect x='130' y='10' width='60' height='60' rx='4' fill='none' stroke='%23000' stroke-width='6'/><rect x='142' y='22' width='36' height='36' rx='2' fill='%23000'/><rect x='10' y='130' width='60' height='60' rx='4' fill='none' stroke='%23000' stroke-width='6'/><rect x='22' y='142' width='36' height='36' rx='2' fill='%23000'/><rect x='90' y='10' width='8' height='8' fill='%23000'/><rect x='102' y='10' width='8' height='8' fill='%23000'/><rect x='90' y='22' width='8' height='8' fill='%23000'/><rect x='90' y='34' width='8' height='8' fill='%23000'/><rect x='102' y='34' width='8' height='8' fill='%23000'/><rect x='10' y='90' width='8' height='8' fill='%23000'/><rect x='22' y='90' width='8' height='8' fill='%23000'/><rect x='34' y='90' width='8' height='8' fill='%23000'/><rect x='46' y='90' width='8' height='8' fill='%23000'/><rect x='10' y='102' width='8' height='8' fill='%23000'/><rect x='34' y='102' width='8' height='8' fill='%23000'/><rect x='58' y='102' width='8' height='8' fill='%23000'/><rect x='90' y='90' width='8' height='8' fill='%23000'/><rect x='102' y='90' width='8' height='8' fill='%23000'/><rect x='114' y='90' width='8' height='8' fill='%23000'/><rect x='90' y='102' width='8' height='8' fill='%23000'/><rect x='114' y='102' width='8' height='8' fill='%23000'/><rect x='130' y='90' width='8' height='8' fill='%23000'/><rect x='142' y='90' width='8' height='8' fill='%23000'/><rect x='154' y='90' width='8' height='8' fill='%23000'/><rect x='166' y='90' width='8' height='8' fill='%23000'/><rect x='178' y='90' width='8' height='8' fill='%23000'/><rect x='130' y='102' width='8' height='8' fill='%23000'/><rect x='154' y='102' width='8' height='8' fill='%23000'/><rect x='178' y='102' width='8' height='8' fill='%23000'/><rect x='130' y='114' width='8' height='8' fill='%23000'/><rect x='142' y='114' width='8' height='8' fill='%23000'/><rect x='166' y='114' width='8' height='8' fill='%23000'/><rect x='90' y='114' width='8' height='8' fill='%23000'/><rect x='114' y='114' width='8' height='8' fill='%23000'/><rect x='130' y='130' width='8' height='8' fill='%23000'/><rect x='154' y='130' width='8' height='8' fill='%23000'/><rect x='178' y='130' width='8' height='8' fill='%23000'/><rect x='142' y='142' width='8' height='8' fill='%23000'/><rect x='166' y='142' width='8' height='8' fill='%23000'/><rect x='130' y='154' width='8' height='8' fill='%23000'/><rect x='142' y='154' width='8' height='8' fill='%23000'/><rect x='154' y='154' width='8' height='8' fill='%23000'/><rect x='178' y='154' width='8' height='8' fill='%23000'/><rect x='130' y='166' width='8' height='8' fill='%23000'/><rect x='154' y='166' width='8' height='8' fill='%23000'/><rect x='166' y='166' width='8' height='8' fill='%23000'/><rect x='130' y='178' width='8' height='8' fill='%23000'/><rect x='142' y='178' width='8' height='8' fill='%23000'/><rect x='166' y='178' width='8' height='8' fill='%23000'/><rect x='178' y='178' width='8' height='8' fill='%23000'/><rect x='90' y='130' width='8' height='8' fill='%23000'/><rect x='102' y='130' width='8' height='8' fill='%23000'/><rect x='114' y='130' width='8' height='8' fill='%23000'/><rect x='90' y='154' width='8' height='8' fill='%23000'/><rect x='102' y='154' width='8' height='8' fill='%23000'/><rect x='90' y='178' width='8' height='8' fill='%23000'/><rect x='114' y='178' width='8' height='8' fill='%23000'/><rect x='46' y='114' width='8' height='8' fill='%23000'/><rect x='58' y='114' width='8' height='8' fill='%23000'/><rect x='22' y='114' width='8' height='8' fill='%23000'/><rect x='46' y='130' width='8' height='8' fill='%23000'/><rect x='22' y='130' width='8' height='8' fill='%23000'/><rect x='58' y='130' width='8' height='8' fill='%23000'/><rect x='10' y='114' width='8' height='8' fill='%23000'/><rect x='34' y='114' width='8' height='8' fill='%23000'/><rect x='10' y='130' width='8' height='8' fill='%23000'/></svg>`;

const plans = [
  {
    id: 'monthly',
    label: '1 Tháng',
    price: 199000,
    duration: '1 tháng',
    content: 'VIP 1 thang',
    badge: null,
  },
  {
    id: 'yearly',
    label: '1 Năm',
    price: 1490000,
    originalPrice: 2388000,
    duration: '12 tháng',
    content: 'VIP 1 nam',
    badge: 'Tiết kiệm 38%',
  },
];

const features = [
  'Unlock toàn bộ kho phim',
  'Phim độc quyền & chiếu sớm',
  'Xem phim không quảng cáo',
  'Âm thanh Dolby Atmos',
  'Hỗ trợ VIP 24/7',
];

const bankInfo = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'CONG TY TNHH PHIM VIP',
};

const VipUpgradeComponent = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [copied, setCopied] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan);

  const formatPrice = (n) => n.toLocaleString('vi-VN');

  const handleCopy = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-black via-red-900 to-black">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <Crown className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            NÂNG CẤP VIP
          </h1>
          <p className="text-base sm:text-lg text-gray-300 px-4">
            Mở khóa toàn bộ kho phim — không quảng cáo, không giới hạn
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-2xl">

        {/* Plan Toggle */}
        <div className="flex gap-3 mb-6 bg-gray-900 p-1.5 rounded-2xl border border-gray-700">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`relative flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
                selectedPlan === p.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan Card */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 border-red-500 shadow-2xl shadow-red-500/20 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Gói VIP</h2>
            <div className="flex items-center gap-1 bg-red-600/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-500/30">
              <Star className="w-3 h-3" />
              <span>{plan.duration}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-red-400">
                {formatPrice(plan.price)}
              </span>
              <span className="text-gray-400 text-sm">VNĐ</span>
            </div>
            {plan.originalPrice && (
              <p className="text-gray-500 text-sm mt-1 line-through">
                {formatPrice(plan.originalPrice)} VNĐ nếu mua từng tháng
              </p>
            )}
            {plan.id === 'yearly' && (
              <p className="text-green-400 text-sm mt-1 font-semibold">
                Chỉ {formatPrice(Math.round(plan.price / 12))} VNĐ/tháng
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 sm:space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment QR Section */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-700">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-white">
            Thanh Toán Qua QR
          </h3>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-2xl mb-3 shadow-lg">
              <img
                src={QR_PLACEHOLDER}
                alt="QR Code thanh toán"
                className="w-44 h-44 sm:w-52 sm:h-52"
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">Quét mã QR bằng app ngân hàng hoặc ví điện tử</p>
          </div>

          {/* Bank Info */}
          <div className="bg-black rounded-xl p-4 sm:p-6 mb-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Ngân hàng</span>
              <span className="text-white font-semibold text-sm">{bankInfo.bankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{bankInfo.accountNumber}</span>
                <button
                  onClick={handleCopy}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors"
                >
                  {copied ? '✓ Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Chủ tài khoản</span>
              <span className="text-white font-semibold text-sm">{bankInfo.accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Nội dung CK</span>
              <span className="text-yellow-400 font-semibold text-sm">{plan.content}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
              <span className="text-white font-semibold text-base sm:text-lg">Số tiền</span>
              <span className="text-red-400 font-bold text-lg sm:text-xl">
                {formatPrice(plan.price)} VNĐ
              </span>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-5">
            <p className="text-yellow-400 text-xs sm:text-sm text-center leading-relaxed">
              ⚠️ Vui lòng nhập đúng nội dung chuyển khoản để được kích hoạt tự động trong vòng <span className="font-bold">5 phút</span>.
            </p>
          </div>

          <p className="text-center text-gray-400 text-xs sm:text-sm">
            Tự động gia hạn. Có thể hủy bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VipUpgradeComponent;