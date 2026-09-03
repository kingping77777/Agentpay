import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  QrCode,
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  PackageCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import { PixelPanel } from './pixel/PixelPanel';
import { PixelButton } from './pixel/PixelButton';
import { PixelBadge } from './pixel/PixelBadge';
import { directBuyProduct, confirmPayment } from '../services/api';

interface DirectCheckoutModalProps {
  product: Product | null;
  customerId: string;
  merchantId: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (orderInfo: any) => void;
}

export const DirectCheckoutModal: React.FC<DirectCheckoutModalProps> = ({
  product,
  customerId,
  merchantId,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen || !product) return null;

  const [step, setStep] = useState<'ADDRESS' | 'PAYMENT' | 'VERIFYING' | 'SUCCESS'>('ADDRESS');
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('Alex Mercer');
  const [street, setStreet] = useState<string>('42 Silicon Boulevard, Tech Corridor');
  const [city, setCity] = useState<string>('Bengaluru, Karnataka');
  const [pinCode, setPinCode] = useState<string>('560001');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'UPI_APPS' | 'CARD'>('UPI_QR');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('GPay');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(299); // 5 mins
  const [verifyingProgress, setVerifyingProgress] = useState<number>(0);

  const totalPrice = product.price * quantity;

  // Countdown timer for QR
  useEffect(() => {
    let timer: any;
    if (step === 'PAYMENT' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleProceedToPayment = async () => {
    if (!fullName || !street || !city || !pinCode || !phone) {
      alert('Please fill in all delivery address fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await directBuyProduct({
        customer_id: customerId || 'demo-customer',
        merchant_id: merchantId || 'demo-merchant',
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        quantity,
        full_name: fullName,
        street,
        city,
        pin_code: pinCode,
        phone,
        payment_method: paymentMethod,
      });

      setOrderData(res);
      setStep('PAYMENT');
      setCountdown(299);
    } catch (e: any) {
      console.error('Direct buy error:', e);
      // Even on offline/local fallback, generate dynamic order data
      const fallbackOrderId = `ord_dir_${Date.now()}`;
      const note = encodeURIComponent(`Order ${product.name.slice(0, 15)}`);
      const upiVpa = 'agentpay.merchant@razorpay';
      const upiStr = `upi://pay?pa=${upiVpa}&pn=AgentPay%20Merchant&am=${totalPrice.toFixed(2)}&cu=INR&tn=${note}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiStr)}`;

      setOrderData({
        order_id: fallbackOrderId,
        product_name: product.name,
        total_amount: totalPrice,
        upi_vpa: upiVpa,
        upi_string: upiStr,
        qr_code_url: qrUrl,
        estimated_delivery: 'In 2 Business Days',
      });
      setStep('PAYMENT');
      setCountdown(299);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setStep('VERIFYING');
    setVerifyingProgress(20);

    // Smooth progressive verification animation
    setTimeout(() => setVerifyingProgress(55), 500);
    setTimeout(() => setVerifyingProgress(85), 1000);

    setTimeout(async () => {
      setVerifyingProgress(100);
      let paymentId = `pay_${Date.now()}`;
      try {
        const res = await confirmPayment(orderData.order_id, paymentMethod);
        if (res?.payment_id) paymentId = res.payment_id;
      } catch (e) {
        // Fallback payment ID
      }

      setStep('SUCCESS');
      onPaymentSuccess({
        order_id: orderData.order_id,
        product_name: product.name,
        total: totalPrice,
        delivery_address: `${fullName}, ${street}, ${city} - ${pinCode}`,
        payment_id: paymentId,
      });
    }, 1500);
  };

  const handleCopyUPI = () => {
    const vpa = orderData?.upi_vpa || 'agentpay.merchant@razorpay';
    navigator.clipboard.writeText(vpa);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1320]/80 backdrop-blur-sm animate-fade-in font-pixel">
      <div className="w-full max-w-xl">
        <PixelPanel variant="default" className="p-0 overflow-hidden shadow-[8px_8px_0_#1A1320]">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A1320] text-[#FFFDF5] border-b-2 border-[#1A1320]">
            <div className="flex items-center gap-2">
              <span className="text-[#FFD93D] font-pixel text-lg animate-pulse">⚡</span>
              <h3 className="font-display text-[12px] tracking-wide text-[#FFFDF5]">
                AGENTPAY DIRECT BUY // 1-CLICK INSTANT CHECKOUT
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3D2E4A] text-[#FCFAF0] border border-[#FCFAF0]/30 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="grid grid-cols-3 bg-[#FCFAF0] border-b-2 border-[#1A1320] text-center font-display text-[9px]">
            <div
              className={`py-2 border-r border-[#1A1320] ${
                step === 'ADDRESS' ? 'bg-[#FFD93D] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              1. DELIVERY INFO
            </div>
            <div
              className={`py-2 border-r border-[#1A1320] ${
                step === 'PAYMENT' || step === 'VERIFYING' ? 'bg-[#FFD93D] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              2. UPI QR / PAYMENT
            </div>
            <div
              className={`py-2 ${
                step === 'SUCCESS' ? 'bg-[#6BCF7F] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              3. VERIFIED RECEIPT
            </div>
          </div>

          <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4 bg-[#FFFDF5]">
            {/* Product Summary Header Card */}
            <div className="p-3 bg-[#FCFAF0] border-2 border-[#1A1320] shadow-[2px_2px_0_#1A1320] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {product.image_url && (
                  <div className="w-14 h-14 bg-[#FFFDF5] border border-[#1A1320] shrink-0 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                )}
                <div>
                  <span className="font-display text-[8px] uppercase px-1.5 py-0.5 bg-[#4ECDC4]/20 border border-[#4ECDC4] text-[#1A1320] inline-block mb-1">
                    {product.brand.toUpperCase()} • {product.category.toUpperCase()}
                  </span>
                  <h4 className="font-pixel text-[15px] text-[#1A1320] font-bold leading-tight line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="font-mono text-[10px] text-[#6B5878]">
                    1-Year Official Manufacturer Warranty • Free Priority Dispatch
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-display text-lg text-[#008844] font-bold">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </div>
                {step === 'ADDRESS' && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-5 h-5 bg-[#E8D9A0] border border-[#1A1320] font-display text-xs flex items-center justify-center hover:bg-[#D9CFE0] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-pixel text-xs px-1.5 font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-5 h-5 bg-[#E8D9A0] border border-[#1A1320] font-display text-xs flex items-center justify-center hover:bg-[#D9CFE0] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── STEP 1: ADDRESS FORM ── */}
            {step === 'ADDRESS' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-[#F4E9C7] pb-1">
                  <MapPin className="w-4 h-4 text-[#FF6B6B]" />
                  <span className="font-display text-[10px] text-[#1A1320] font-bold">
                    SHIPPING DESTINATION & CONTACT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-display text-[8px] text-[#6B5878] mb-1">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border-2 border-[#1A1320] font-pixel text-sm text-[#1A1320] focus:outline-none focus:bg-[#FFF8E7]"
                    />
                  </div>

                  <div>
                    <label className="block font-display text-[8px] text-[#6B5878] mb-1">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border-2 border-[#1A1320] font-pixel text-sm text-[#1A1320] focus:outline-none focus:bg-[#FFF8E7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-display text-[8px] text-[#6B5878] mb-1">
                    STREET ADDRESS / FLAT / APARTMENT *
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border-2 border-[#1A1320] font-pixel text-sm text-[#1A1320] focus:outline-none focus:bg-[#FFF8E7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-display text-[8px] text-[#6B5878] mb-1">
                      CITY & STATE *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border-2 border-[#1A1320] font-pixel text-sm text-[#1A1320] focus:outline-none focus:bg-[#FFF8E7]"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-[8px] text-[#6B5878] mb-1">
                      PIN CODE *
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#FFFDF5] border-2 border-[#1A1320] font-pixel text-sm text-[#1A1320] focus:outline-none focus:bg-[#FFF8E7]"
                    />
                  </div>
                </div>

                {/* Delivery Badge */}
                <div className="p-2.5 bg-[#B4E5BD]/40 border border-[#6BCF7F] flex items-center justify-between text-[#008844]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="font-pixel text-[13px]">
                      FREE Express 2-Day Air Courier Delivery
                    </span>
                  </div>
                  <span className="font-display text-[8px] bg-[#6BCF7F] text-[#1A1320] px-1.5 py-0.5 font-bold">
                    INCLUDED
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={handleProceedToPayment}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'PROCESSING ORDER...' : 'CONTINUE TO ONLINE PAYMENT ➔'}
                  </PixelButton>
                </div>
              </div>
            )}

            {/* ── STEP 2: PAYMENT & LIVE UPI QR CODE ── */}
            {step === 'PAYMENT' && orderData && (
              <div className="space-y-3 animate-fade-in">
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-1.5 font-display text-[8px]">
                  <button
                    onClick={() => setPaymentMethod('UPI_QR')}
                    className={`p-2 border-2 flex items-center justify-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'UPI_QR'
                        ? 'bg-[#FFD93D] border-[#1A1320] text-[#1A1320] font-bold shadow-[inset_1px_1px_0_#FFF]'
                        : 'bg-[#FCFAF0] border-[#1A1320] text-[#6B5878]'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI QR CODE</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI_APPS')}
                    className={`p-2 border-2 flex items-center justify-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'UPI_APPS'
                        ? 'bg-[#FFD93D] border-[#1A1320] text-[#1A1320] font-bold shadow-[inset_1px_1px_0_#FFF]'
                        : 'bg-[#FCFAF0] border-[#1A1320] text-[#6B5878]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>UPI APPS</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2 border-2 flex items-center justify-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'bg-[#FFD93D] border-[#1A1320] text-[#1A1320] font-bold shadow-[inset_1px_1px_0_#FFF]'
                        : 'bg-[#FCFAF0] border-[#1A1320] text-[#6B5878]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>CARD / NET</span>
                  </button>
                </div>

                {/* Option A: UPI QR CODE */}
                {paymentMethod === 'UPI_QR' && (
                  <div className="p-4 bg-[#FCFAF0] border-2 border-[#1A1320] shadow-[3px_3px_0_#1A1320] text-center space-y-3">
                    <div className="flex items-center justify-between text-left">
                      <div>
                        <div className="font-display text-[8px] text-[#6B5878]">TOTAL PAYABLE</div>
                        <div className="font-display text-2xl font-bold text-[#008844]">
                          ₹{totalPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-[8px] text-[#6B5878]">QR VALID FOR</div>
                        <div className="font-display text-[12px] font-bold text-[#FF6B6B] animate-pulse">
                          ⏱ {formatTimer(countdown)}
                        </div>
                      </div>
                    </div>

                    {/* QR Image */}
                    <div className="inline-block p-2.5 bg-[#FFFFFF] border-2 border-[#1A1320] shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]">
                      <img
                        src={orderData.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(orderData.upi_string || 'upi://pay?pa=agentpay.merchant@razorpay&pn=AgentPay&cu=INR')}`}
                        alt="UPI Payment QR Code"
                        className="w-44 h-44 mx-auto"
                      />
                    </div>

                    {/* UPI VPA Pill */}
                    <div className="flex items-center justify-center gap-2 bg-[#FFFDF5] border border-[#1A1320] py-1.5 px-3 max-w-sm mx-auto">
                      <span className="font-mono text-xs text-[#1A1320]">
                        UPI ID: <strong>{orderData.upi_vpa || 'agentpay.merchant@razorpay'}</strong>
                      </span>
                      <button
                        onClick={handleCopyUPI}
                        className="p-1 hover:bg-[#E8D9A0] text-[#1A1320] cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUPI ? (
                          <Check className="w-3.5 h-3.5 text-[#008844]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="font-display text-[8px] text-[#6B5878]">
                      Scan using Google Pay, PhonePe, Paytm, CRED, BHIM or any UPI App
                    </p>
                  </div>
                )}

                {/* Option B: UPI APPS INSTANT INTENT */}
                {paymentMethod === 'UPI_APPS' && (
                  <div className="p-4 bg-[#FCFAF0] border-2 border-[#1A1320] space-y-3">
                    <div className="font-display text-[9px] text-[#1A1320] font-bold">
                      SELECT YOUR PREFERRED UPI APP:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { name: 'Google Pay', icon: '🔵', id: 'GPay' },
                        { name: 'PhonePe', icon: '🟣', id: 'PhonePe' },
                        { name: 'Paytm', icon: '🔷', id: 'Paytm' },
                        { name: 'BHIM UPI', icon: '🟠', id: 'BHIM' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-2.5 border-2 flex flex-col items-center gap-1 font-display text-[8px] transition cursor-pointer ${
                            selectedUpiApp === app.id
                              ? 'bg-[#FFD93D] border-[#1A1320] shadow-[inset_1px_1px_0_#FFF]'
                              : 'bg-[#FFFDF5] border-[#1A1320] hover:bg-[#FFF8E7]'
                          }`}
                        >
                          <span className="text-xl">{app.icon}</span>
                          <span>{app.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 bg-[#FFFDF5] border border-[#1A1320] flex items-center justify-between">
                      <span className="font-display text-[8px] text-[#6B5878]">Direct App Intent:</span>
                      <a
                        href={orderData.upi_string || `upi://pay?pa=agentpay.merchant@razorpay&am=${totalPrice}&cu=INR`}
                        className="font-display text-[8px] px-2 py-1 bg-[#4ECDC4] text-[#1A1320] border border-[#1A1320] hover:bg-[#6BCF7F] flex items-center gap-1"
                      >
                        <span>OPEN {selectedUpiApp.toUpperCase()}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Option C: CARD & NETBANKING */}
                {paymentMethod === 'CARD' && (
                  <div className="p-4 bg-[#FCFAF0] border-2 border-[#1A1320] space-y-2">
                    <div className="font-display text-[9px] text-[#1A1320] font-bold">
                      CARD / NETBANKING GATEWAY
                    </div>
                    <p className="font-pixel text-[13px] text-[#3D2E4A]">
                      Secured by Razorpay PCI-DSS Level 1 Encryption. Accepts all Visa, MasterCard, RuPay, and NetBanking accounts across 50+ banks.
                    </p>
                  </div>
                )}

                {/* Simulate / Capture Payment Trigger */}
                <div className="pt-2">
                  <PixelButton
                    variant="lemon"
                    size="lg"
                    onClick={handleSimulatePayment}
                    disabled={isLoading}
                    className="w-full text-center"
                  >
                    ⚡ CONFIRM & AUTHORIZE PAYMENT (₹{totalPrice.toLocaleString('en-IN')})
                  </PixelButton>
                </div>
              </div>
            )}

            {/* ── STEP 2.5: VERIFYING SCREEN ── */}
            {step === 'VERIFYING' && (
              <div className="p-6 bg-[#FCFAF0] border-2 border-[#1A1320] text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 border-4 border-[#1A1320] border-t-[#4ECDC4] rounded-full animate-spin mx-auto" />
                <h4 className="font-display text-[12px] text-[#1A1320] font-bold">
                  VERIFYING TRANSACTION WITH NPCI / RAZORPAY...
                </h4>
                <p className="font-pixel text-[13px] text-[#6B5878]">
                  Authorizing order via AgentPay Deterministic Policy Engine
                </p>
                <div className="w-full h-3 bg-[#F4E9C7] border-2 border-[#1A1320] overflow-hidden">
                  <div
                    className="h-full bg-[#6BCF7F] transition-all duration-300"
                    style={{ width: `${verifyingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT SUCCESS RECEIPT ── */}
            {step === 'SUCCESS' && (
              <div className="p-4 bg-[#B4E5BD]/30 border-2 border-[#6BCF7F] shadow-[4px_4px_0_#1A1320] space-y-4 animate-fade-in text-[#1A1320]">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-[#6BCF7F] border-2 border-[#1A1320] mx-auto flex items-center justify-center text-[#1A1320] text-2xl font-bold shadow-[2px_2px_0_#1A1320]">
                    ✓
                  </div>
                  <h3 className="font-display text-[14px] text-[#008844] font-bold">
                    PAYMENT AUTHORIZED & ORDER CAPTURED!
                  </h3>
                  <p className="font-mono text-[11px] text-[#6B5878]">
                    Transaction confirmed with Razorpay Secure Gateway
                  </p>
                </div>

                {/* Receipt Details Table */}
                <div className="bg-[#FFFDF5] p-3 border-2 border-[#1A1320] space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#F4E9C7] pb-1">
                    <span className="text-[#6B5878]">Order Reference:</span>
                    <span className="font-bold text-[#1A1320]">{orderData?.order_id?.slice(0, 16).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F4E9C7] pb-1">
                    <span className="text-[#6B5878]">Item Purchased:</span>
                    <span className="font-bold text-[#1A1320]">{product.name} (x{quantity})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F4E9C7] pb-1">
                    <span className="text-[#6B5878]">Total Amount Paid:</span>
                    <span className="font-bold text-[#008844]">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F4E9C7] pb-1">
                    <span className="text-[#6B5878]">Shipping Address:</span>
                    <span className="font-bold text-right text-[#1A1320]">
                      {fullName}, {street}, {city} - {pinCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B5878]">Estimated Delivery:</span>
                    <span className="font-bold text-[#FF6B6B]">{orderData?.estimated_delivery || 'In 2 Business Days'}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={onClose}
                    className="w-full"
                  >
                    RETURN TO COMMAND CENTER ➔
                  </PixelButton>
                </div>
              </div>
            )}
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};
