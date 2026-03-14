
import React from 'react';

interface AttentionModalProps {
  onClose: () => void;
}

const AttentionModal: React.FC<AttentionModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg">
            <span className="text-4xl">✨</span>
          </div>
          
          <h2 className="text-3xl font-black mb-6 text-gray-900 tracking-tight leading-tight">
            Halo Kreator!
          </h2>
          
          <div className="space-y-6 mb-8 text-left">
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <p className="text-gray-800 leading-relaxed font-medium">
                  Perhatian: aplikasi ini dirancang untuk <span className="text-purple-700 font-bold">UMKM dan Affiliator</span> agar memudahkan promosi tanpa harus ada sample produk fisik. 
                </p>
                <p className="mt-4 text-gray-700 italic border-t border-purple-200 pt-4">
                  Jangan generate konten yang tak senonoh ya, dosa tau 😁
                </p>
              </div>
              
              <div className="pt-2 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-2">Developed By</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                  <span className="text-purple-600 font-extrabold text-sm tracking-tight">@anggipras_</span>
                </div>
              </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-200 active:scale-95 uppercase tracking-widest text-sm"
          >
            Siap, Lanjutkan!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttentionModal;
