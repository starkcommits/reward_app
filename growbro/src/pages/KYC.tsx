import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const KYC = () => {
  const navigate = useNavigate();
  const [panNumber, setPanNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyPAN = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus('verifying');
    
    // TODO: Implement actual PAN verification API
    setTimeout(() => {
      setVerificationStatus('verified');
      // After successful verification, wait a bit and redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <button 
            onClick={() => navigate('/signup')}
            className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
            <p className="text-gray-600">Complete KYC to start trading</p>
          </div>

          <form onSubmit={handleVerifyPAN} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Card Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                placeholder="Enter PAN number"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength={10}
                required
                disabled={verificationStatus === 'verified'}
              />
              <p className="mt-2 text-sm text-gray-500">
                Format: ABCDE1234F
              </p>
            </div>

            {verificationStatus === 'verified' && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">PAN Verified Successfully</span>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Verification Failed. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verificationStatus === 'verifying' || verificationStatus === 'verified'}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verificationStatus === 'verifying' && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {verificationStatus === 'verifying' ? 'Verifying...' : 
               verificationStatus === 'verified' ? 'Verified' : 'Verify PAN'}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-4">Why do we need this?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• To comply with regulatory requirements</p>
              <p>• To prevent fraud and ensure secure trading</p>
              <p>• To verify your identity for withdrawals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYC;