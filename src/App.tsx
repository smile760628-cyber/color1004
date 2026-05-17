import { useState, useRef, useCallback, ChangeEvent } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Info,
  Sparkles,
  Shirt,
  Scissors,
  User,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorRec {
  name: string;
  hex: string;
  reason: string;
}

interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: string;
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: ColorRec[];
  avoid_colors: ColorRec[];
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imgData: string) => {
    setLoading(true);
    setError(null);
    setStep('analyzing');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgData }),
      });
      if (!response.ok) throw new Error('분석 실패');
      const data = await response.json();
      setResult(data);
      setStep('result');
    } catch (err) {
      setError('이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="h-20 px-10 flex items-center justify-between border-b border-stone-200 sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-stone-400" />
          <h1 className="text-2xl font-serif font-medium tracking-tight">
            ColorMuse <span className="text-stone-400 font-sans text-xs tracking-widest uppercase ml-2 hidden sm:inline">Expert Diagnosis</span>
          </h1>
        </div>
        {step === 'result' && (
          <button 
            onClick={reset}
            className="px-5 py-2 rounded-full border border-stone-300 text-[10px] font-bold hover:bg-stone-50 transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            New Analysis
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="text-center space-y-6">
                <h2 className="text-5xl md:text-7xl font-serif italic font-medium tracking-tight leading-none text-stone-800">
                  Find Your <br />
                  <span className="text-stone-400 not-italic font-sans uppercase text-sm tracking-[0.3em]">Pure Palette</span>
                </h2>
                <p className="text-stone-500 max-w-lg mx-auto font-light leading-relaxed">
                  Professional AI analysis reveals the subtle undertones 
                  that harmonize with your natural radiant beauty.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-16 bg-white border border-stone-200 rounded-[3rem] hover:ring-1 hover:ring-stone-400 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500"
                >
                  <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-6 h-6 text-stone-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-800">Upload Portrait</span>
                  <span className="text-[10px] text-stone-400 mt-2 uppercase tracking-tighter">JPG, PNG or GIF</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-16 bg-stone-800 text-white rounded-[3rem] hover:shadow-xl hover:shadow-stone-300/30 transition-all duration-500"
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Camera className="w-6 h-6 opacity-80" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Take Snapshot</span>
                  <span className="text-[10px] opacity-40 mt-2 uppercase tracking-tighter">Use Front Camera</span>
                  <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" capture="user" className="hidden" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 justify-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="bg-white p-10 rounded-[2.5rem] max-w-2xl mx-auto border border-stone-100 shadow-sm">
                <div className="flex gap-6 items-start">
                  <div className="p-3 bg-stone-50 rounded-2xl">
                    <Info className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-stone-800">Expert Guidelines</h4>
                    <ul className="text-xs text-stone-500 leading-loose space-y-1">
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-stone-300" /> Natural lighting yields best results</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-stone-300" /> Minimal makeup is highly recommended</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-stone-300" /> Avoid using filters or heavy editing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-10"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="w-40 h-40 rounded-full border border-stone-200 border-t-stone-800"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-serif italic text-stone-400">Analysing</span>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-serif italic text-stone-800">Decoding Your Aura</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 animate-pulse">Measuring Luminance • Saturation • Contrast</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-20 pb-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-8 space-y-10">
                  <div className="bg-white rounded-[48px] shadow-lg border border-stone-100 overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                      <span className="text-[180px] font-serif italic -rotate-12 translate-y-12 select-none">
                        {result.tone_direction === 'warm' ? 'Warm' : result.tone_direction === 'cool' ? 'Cool' : 'Neutral'}
                      </span>
                    </div>

                    <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row gap-12 items-start">
                      <div className="w-48 h-60 rounded-3xl overflow-hidden shadow-2xl shrink-0 group-hover:scale-[1.02] transition-transform duration-700">
                        <img src={image!} alt="Your Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-8 flex-1">
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Diagnostic Result</p>
                          <h2 className="text-6xl font-serif italic text-stone-800 leading-[0.9]">
                            {result.season_type}
                          </h2>
                          <h3 className="text-2xl font-light text-stone-500">
                            {result.sub_type}
                          </h3>
                        </div>
                        <p className="text-sm md:text-md leading-relaxed text-stone-600 font-light border-l border-stone-200 pl-6 italic">
                          "{result.summary}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-8">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">1. Skin Analysis</h3>
                      <div className="space-y-6">
                        {[
                          { label: 'Skin Tone', value: result.analysis.skin_tone },
                          { label: 'Brightness', value: result.analysis.brightness },
                          { label: 'Saturation', value: result.analysis.saturation },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span>{item.label}</span>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">{item.value}</p>
                            <div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: '100%' }} 
                                transition={{ delay: 0.5, duration: 1 }}
                                className="h-full bg-stone-200" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-8">
                       <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">2. Impression</h3>
                       <div className="space-y-6">
                        {[
                          { label: 'Contrast', value: result.analysis.contrast },
                          { label: 'Overall', value: result.analysis.overall_impression },
                        ].map((item, idx) => (
                          <div key={idx} className="p-5 bg-stone-50 rounded-2xl space-y-2 border border-stone-100/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{item.label}</span>
                            <p className="text-xs text-stone-600 leading-relaxed font-medium">{item.value}</p>
                          </div>
                        ))}
                        <div className="p-6 border border-stone-100 rounded-3xl text-center">
                          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Analysis Confidence</span>
                          <p className="text-3xl font-serif text-stone-400 italic mt-1">{(result.confidence * 10).toFixed(0)}%</p>
                        </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 space-y-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">3. Color Recommendation</h2>
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-4 tracking-widest italic">Best Palettes</p>
                        <div className="grid grid-cols-4 gap-3">
                          {result.recommended_colors.slice(0, 8).map((color, idx) => (
                            <motion.div 
                              key={idx}
                              whileHover={{ scale: 1.1, zIndex: 10 }}
                              className="aspect-square rounded-xl shadow-sm border border-black/5"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="pt-6 border-t border-stone-50">
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-4 tracking-widest italic">Colors to Avoid</p>
                        <div className="flex gap-2 flex-wrap">
                          {result.avoid_colors.slice(0, 5).map((color, idx) => (
                            <div 
                              key={idx}
                              className="w-10 h-10 rounded-xl relative overflow-hidden group border border-stone-100"
                              style={{ backgroundColor: color.hex }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-white mix-blend-difference">✕</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-stone-800 text-white rounded-[2.5rem] p-10 shadow-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Sparkles className="w-40 h-40" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-stone-400" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Expert Styling Tip</h2>
                      </div>
                      <p className="text-2xl font-serif italic leading-snug">
                        "{result.style_tip}"
                      </p>
                    </div>
                  </section>
                </div>
              </div>

              {/* Lifestyle Sections */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-xl">💄</div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-[10px]">Makeup Palette</p>
                      <p className="text-sm font-serif italic text-stone-600">Pure & Refined</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-stone-50">
                    <div>
                      <span className="text-[10px] font-bold text-stone-300 uppercase block mb-2">Recommended Lip</span>
                      <div className="flex flex-wrap gap-2">
                        {result.makeup_recommendations.lip.map((item, i) => (
                          <span key={i} className="text-xs font-medium px-3 py-1 bg-stone-50 rounded-full border border-stone-200/50">{item}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-300 uppercase block mb-2">Blush & Eyes</span>
                      <p className="text-xs text-stone-500 italic leading-relaxed">
                        {[...result.makeup_recommendations.blush, ...result.makeup_recommendations.eyeshadow].join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-xl">✂️</div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-[10px]">Hair Styling</p>
                      <p className="text-sm font-serif italic text-stone-600">Organic Harmony</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-stone-50">
                    {result.hair_recommendations.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-xl">🧥</div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-[10px]">Wardrobe</p>
                      <p className="text-sm font-serif italic text-stone-600">Curated Textures</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-stone-50">
                    <p className="text-xs text-stone-500 leading-loose font-light">
                      {result.fashion_recommendations.join(' • ')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer Disclaimer */}
              <footer className="pt-12 border-t border-stone-200 flex flex-col items-center justify-center gap-6">
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] text-center max-w-2xl leading-loose">
                  Analysis is based on photographic data and may vary depending on lighting conditions. {result.photo_quality_note}
                </p>
                <div className="h-6 w-px bg-stone-200" />
                <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] font-bold">
                  ColorMuse Digital Atelier
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-stone-100 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] bg-stone-200 rounded-full blur-[160px] opacity-20" />
      </div>
    </div>
  );
}
