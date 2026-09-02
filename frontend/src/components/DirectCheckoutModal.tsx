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

  const [step, setStep] = useState<'ADDRESS' | 'PAYMENT' | 'SUCCESS'>('ADDRESS');
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('Alex Mercer');
  const [street, setStreet] = useState<string>('42 Silicon Boulevard, Tech Corridor');
  const [city, setCity] = useState<string>('Bengaluru, Karnataka');
  const [pinCode, setPinCode] = useState<string>('560001');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'CARD'>('UPI_QR');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(299); // 5 mins

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
        customer_id: customerId,
        merchant_id: merchantId,
        product_id: product.id,
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
      alert(`Error creating direct order: ${e.response?.data?.detail || e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setIsLoading(true);
    try {
      const res = await confirmPayment(orderData.order_id, paymentMethod);
      setStep('SUCCESS');
      onPaymentSuccess({
        order_id: orderData.order_id,
        product_name: product.name,
        total: totalPrice,
        delivery_address: `${fullName}, ${street}, ${city} - ${pinCode}`,
        payment_id: res.payment_id,
      });
    } catch (e: any) {
      alert(`Payment confirmation error: ${e.response?.data?.detail || e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUPI = () => {
    if (orderData?.upi_vpa) {
      navigator.clipboard.writeText(orderData.upi_vpa);
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1320]/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl">
        <PixelPanel variant="default" className="p-0 overflow-hidden shadow-[8px_8px_0_#1A1320]">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A1320] text-[#FFFDF5] border-b-2 border-[#1A1320]">
            <div className="flex items-center gap-2">
              <span className="text-[#FFCC00] font-pixel text-lg animate-pulse">⚡</span>
              <h3 className="font-pixel text-[16px] tracking-wide text-[#FFFDF5]">
                DIRECT BUY // 1-CLICK INSTANT ORDER
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#332244] text-[#FCFAF0] border border-[#FCFAF0]/30 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="grid grid-cols-3 bg-[#FCFAF0] border-b-2 border-[#1A1320] text-center font-display text-[10px]">
            <div
              className={`py-2 border-r border-[#1A1320] ${
                step === 'ADDRESS' ? 'bg-[#FFCC00] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              1. DELIVERY INFO
            </div>
            <div
              className={`py-2 border-r border-[#1A1320] ${
                step === 'PAYMENT' ? 'bg-[#FFCC00] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              2. UPI QR / PAYMENT
            </div>
            <div
              className={`py-2 ${
                step === 'SUCCESS' ? 'bg-[#51CF66] text-[#1A1320] font-bold' : 'text-[#6B5878]'
              }`}
            >
              3. VERIFIED RECEIPT
            </div>
          </div>

          <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4">
            {/* Product Summary Header Card */}
            <div className="p-3 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[2px_2px_0_#1A1320] flex items-center justify-between">
              <div>
                <span className="font-display text-[9px] uppercase px-1.5 py-0.5 bg-[#59CBE8]/30 border border-[#59CBE8] text-[#1A1320] inline-block mb-1">
                  {product.category}
                </span>
                <h4 className="font-pixel text-[17px] text-[#1A1320] font-bold leading-tight">
                  {product.name}
                </h4>
                <p className="font-mono text-[11px] text-[#6B5878]">
                  SKU: {product.id.slice(0, 8).toUpperCase()} • 1-Year Official TechStore Warranty
                </p>
              </div>

              <div className="text-right">
                <div className="font-mono text-xl text-[#008844] font-bold">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </div>
                {step === 'ADDRESS' && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-5 h-5 bg-[#E6DBBD] border border-[#1A1320] font-display text-xs flex items-center justify-center hover:bg-[#D4C8A6]"
                    >
                      -
                    </button>
                    <span className="font-pixel text-xs px-1.5">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-5 h-5 bg-[#E6DBBD] border border-[#1A1320] font-display text-xs flex items-center justify-center hover:bg-[#D4C8A6]"
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
                <div className="flex items-center gap-2 border-b border-[#E6DBBD] pb-1">
                  <MapPin className="w-4 h-4 text-[#FF6B6B]" />
                  <span className="font-display text-[11px] text-[#1A1320] font-bold">
                    SHIPPING DESTINATION & CONTACT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-display text-[9px] text-[#6B5878] mb-1">
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
                    <label className="block font-display text-[9px] text-[#6B5878] mb-1">
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
                  <label className="block font-display text-[9px] text-[#6B5878] mb-1">
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
                    <label className="block font-display text-[9px] text-[#6B5878] mb-1">
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
                    <label className="block font-display text-[9px] text-[#6B5878] mb-1">
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
                <div className="p-2.5 bg-[#EBFBEE] border border-[#51CF66] flex items-center justify-between text-[#008844]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="font-pixel text-[13px]">
                      FREE Express 2-Day Air Courier Delivery
                    </span>
                  </div>
                  <span className="font-display text-[9px] bg-[#51CF66] text-[#1A1320] px-1.5 py-0.5 font-bold">
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
                    {isLoading ? 'PROCESSING...' : 'CONTINUE TO ONLINE PAYMENT ➔'}
                  </PixelButton>
                </div>
              </div>
            )}

            {/* ── STEP 2: PAYMENT & LIVE UPI QR CODE ── */}
            {step === 'PAYMENT' && orderData && (
              <div className="space-y-4 animate-fade-in">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI_QR')}
                    className={`p-2 border-2 flex items-center justify-center gap-1.5 font-pixel text-xs transition ${
                      paymentMethod === 'UPI_QR'
                        ? 'bg-[#FFCC00] border-[#1A1320] text-[#1A1320] font-bold shadow-[inset_1px_1px_0_#FFF]'
                        : 'bg-[#FFFDF5] border-[#1A1320] text-[#6B5878]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    ⚡ INSTANT UPI QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2 border-2 flex items-center justify-center gap-1.5 font-pixel text-xs transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-[#FFCC00] border-[#1A1320] text-[#1A1320] font-bold shadow-[inset_1px_1px_0_#FFF]'
                        : 'bg-[#FFFDF5] border-[#1A1320] text-[#6B5878]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    💳 CARD / NETBANKING
                  </button>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-[#FFFDF5] border-2 border-[#1A1320] shadow-[3px_3px_0_#1A1320] text-center space-y-3">
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <div className="font-display text-[9px] text-[#6B5878]">AMOUNT PAYABLE</div>
                      <div className="font-mono text-2xl font-bold text-[#008844]">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[9px] text-[#6B5878]">QR EXPIRES IN</div>
                      <div className="font-mono text-sm font-bold text-[#FF6B6B] animate-pulse">
                        ⏱ {formatTimer(countdown)}
                      </div>
                    </div>
                  </div>

                  {/* QR Image */}
                  <div className="inline-block p-2 bg-[#FFFFFF] border-2 border-[#1A1320] shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]">
                    <img
                      src={orderData.qr_code_url}
                      alt="UPI Payment QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>

                  {/* UPI VPA Pill */}
                  <div className="flex items-center justify-center gap-2 bg-[#FCFAF0] border border-[#1A1320] py-1.5 px-3 max-w-sm mx-auto">
                    <span className="font-mono text-xs text-[#1A1320]">
                      UPI ID: <strong>{orderData.upi_vpa}</strong>
                    </span>
                    <button
                      onClick={handleCopyUPI}
                      className="p-1 hover:bg-[#E6DBBD] text-[#1A1320]"
                      title="Copy UPI ID"
                    >
                      {copiedUPI ? (
                        <Check className="w-3.5 h-3.5 text-[#008844]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="font-display text-[9px] text-[#6B5878]">
                    Scan using Google Pay, PhonePe, Paytm, CRED, BHIM or any UPI App
                  </p>

                  {/* Payment Simulator Button */}
                  <div className="pt-2">
                    <PixelButton
                      variant="primary"
                      size="lg"
                      onClick={handleSimulatePayment}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'VERIFYING WITH RAZORPAY...' : '⚡ SIMULATE APP SCAN & COMPLETE PAYMENT'}
                    </PixelButton>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT SUCCESS RECEIPT ── */}
            {step === 'SUCCESS' && (
              <div className="p-4 bg-[#EBFBEE] border-2 border-[#51CF66] shadow-[4px_4px_0_#1A1320] space-y-4 animate-fade-in text-[#1A1320]">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-[#51CF66] border-2 border-[#1A1320] mx-auto flex items-center justify-center text-[#1A1320] text-2xl">
                    ✓
                  </div>
                  <h3 className="font-pixel text-xl text-[#008844] font-bold">
                    PAYMENT AUTHORIZED & ORDER CAPTURED!
                  </h3>
                  <p className="font-mono text-xs text-[#6B5878]">
                    Transaction confirmed with Razorpay Secure Gateway
                  </p>
                </div>

                {/* Receipt Details Table */}
                <div className="bg-[#FFFDF5] p-3 border border-[#1A1320] space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#E6DBBD] pb-1">
                    <span className="text-[#6B5878]">Order Reference:</span>
                    <span className="font-bold text-[#1A1320]">{orderData?.order_id?.slice(0, 16).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6DBBD] pb-1">
                    <span className="text-[#6B5878]">Item Purchased:</span>
                    <span className="font-bold text-[#1A1320]">{product.name} (x{quantity})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6DBBD] pb-1">
                    <span className="text-[#6B5878]">Total Amount Paid:</span>
                    <span className="font-bold text-[#008844]">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6DBBD] pb-1">
                    <span className="text-[#6B5878]">Shipping Address:</span>
                    <span className="font-bold text-right text-[#1A1320]">
                      {fullName}, {street}, {city} - {pinCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B5878]">Estimated Delivery:</span>
                    <span className="font-bold text-[#FF6B6B]">{orderData?.estimated_delivery}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <PixelButton
                    variant="secondary"
                    size="md"
                    onClick={onClose}
                    className="w-full"
                  >
                    PRINT RECEIPT & RETURN TO COMMAND CENTER
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
