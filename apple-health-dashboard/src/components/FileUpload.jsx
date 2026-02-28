import React, { useRef, useState } from 'react';

export default function FileUpload({ onFileLoad, onUseDemo }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.xml') && file.type !== 'text/xml' && file.type !== 'application/xml') {
      setError('Lütfen Apple Health export.xml dosyasını seçin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      onFileLoad(text, file.name);
    } catch (e) {
      setError('Dosya okunamadı: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl">🍎</span>
          <h1 className="text-3xl font-bold text-white">Apple Health Dashboard</h1>
        </div>
        <p className="text-gray-400 max-w-md">
          Apple Health verilerinizi görselleştirin. iPhone'dan dışa aktardığınız{' '}
          <code className="text-orange-400 bg-gray-800 px-1 rounded text-sm">export.xml</code>{' '}
          dosyasını yükleyin.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-orange-400 bg-orange-400/10 scale-[1.02]'
            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900'
          }
        `}
      >
        <div className="text-5xl mb-4">📁</div>
        <p className="text-white font-medium mb-1">
          {loading ? 'Yükleniyor...' : 'export.xml dosyasını buraya sürükleyin'}
        </p>
        <p className="text-gray-500 text-sm">veya tıklayın</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,text/xml,application/xml"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm max-w-lg w-full">
          {error}
        </div>
      )}

      {/* How to export */}
      <div className="mt-6 max-w-lg w-full bg-gray-900 rounded-xl p-4 text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">📱 iPhone'dan nasıl dışa aktarılır?</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>Sağlık uygulamasını aç</li>
          <li>Sağ üstteki profil simgesine dokun</li>
          <li>Sayfanın en altına in</li>
          <li>"Tüm Sağlık Verilerini Dışa Aktar"a dokun</li>
          <li>Dışa aktarılan zip dosyasından <code className="text-orange-400">export.xml</code> dosyasını çıkar</li>
        </ol>
      </div>

      {/* Demo button */}
      <div className="mt-6">
        <button
          onClick={onUseDemo}
          className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors border border-gray-700"
        >
          Demo verilerle dene →
        </button>
      </div>
    </div>
  );
}
