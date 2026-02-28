import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { parseHealthXML, generateDemoData } from './utils/healthParser';
import './index.css';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsing, setParsing] = useState(false);

  const handleFileLoad = useCallback(async (xmlText, name) => {
    setParsing(true);
    setParseError(null);
    try {
      await new Promise((r) => setTimeout(r, 10));
      const data = parseHealthXML(xmlText);
      if (!Object.keys(data).length) {
        throw new Error('Geçerli sağlık verisi bulunamadı. Dosya doğru formatta mı?');
      }
      setHealthData(data);
      setFileName(name);
      setIsDemo(false);
    } catch (e) {
      setParseError(e.message);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleUseDemo = useCallback(() => {
    const data = generateDemoData();
    setHealthData(data);
    setFileName('demo');
    setIsDemo(true);
    setParseError(null);
  }, []);

  const handleReset = useCallback(() => {
    setHealthData(null);
    setFileName('');
    setIsDemo(false);
    setParseError(null);
  }, []);

  if (parsing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">🍎</div>
        <p className="text-gray-400">Veriler işleniyor...</p>
        <p className="text-gray-600 text-sm">Büyük dosyalar birkaç saniye sürebilir</p>
      </div>
    );
  }

  if (parseError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-4xl">❌</div>
        <p className="text-red-400 text-lg font-medium">Dosya işlenemedi</p>
        <p className="text-gray-500 text-sm max-w-md text-center">{parseError}</p>
        <button
          onClick={handleReset}
          className="mt-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  if (!healthData) {
    return <FileUpload onFileLoad={handleFileLoad} onUseDemo={handleUseDemo} />;
  }

  return (
    <Dashboard
      healthData={healthData}
      fileName={fileName}
      isDemo={isDemo}
      onReset={handleReset}
    />
  );
}
