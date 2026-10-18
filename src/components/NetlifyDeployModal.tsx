import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CloudUpload, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Github, 
  Sparkles,
  Layers,
  FileCode2,
  Cpu
} from 'lucide-react';
import { Language } from '../types';

interface NetlifyDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NetlifyDeployModal: React.FC<NetlifyDeployModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'drop' | 'github' | 'cli'>('drop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPt = language === 'pt';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-teal-500/30 bg-stone-900 shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 p-5 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-inner">
              <CloudUpload className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isPt ? 'Publicar Site no Netlify' : 'Deploy Website to Netlify'}
                </h3>
                <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                  {isPt ? '100% PRONTO' : 'READY'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isPt 
                  ? 'Configuração automática gerada: netlify.toml, rotas SPA e pacote de build otimizado.' 
                  : 'Automated configuration ready: netlify.toml, SPA routing and optimized assets.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Readiness Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>netlify.toml</span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isPt ? 'Configurado na raiz' : 'Set at root'}
              </p>
            </div>

            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>_redirects</span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isPt ? 'Rotas SPA 200 OK' : 'SPA 200 OK routes'}
              </p>
            </div>

            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>dist/ build</span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isPt ? 'Compilado e testado' : 'Built & verified'}
              </p>
            </div>

            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isPt ? 'Globo 3D' : '3D Globe'}</span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isPt ? 'Texturas em cache' : 'Cached textures'}
              </p>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/60 via-stone-900 to-stone-900 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                <h4 className="text-sm font-bold text-white">
                  {isPt ? 'Pacote Pronto para Download' : 'Ready-to-Deploy Package'}
                </h4>
              </div>
              <p className="text-xs text-stone-300 max-w-md">
                {isPt 
                  ? 'Baixe o pacote zip com todos os arquivos estáticos, texturas 3D e rotas prontos para arrastar no Netlify Drop.'
                  : 'Download the prepared zip with all static assets, 3D textures and routes ready for Netlify Drop.'}
              </p>
            </div>
            <a
              href="/terraadapt-netlify.zip"
              download="terraadapt-netlify.zip"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-teal-950 hover:from-teal-400 hover:to-cyan-500 transition-all shrink-0 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>{isPt ? 'Baixar Pacote (.zip)' : 'Download Package (.zip)'}</span>
            </a>
          </div>

          {/* Deployment Method Tabs */}
          <div className="space-y-4">
            <div className="flex border-b border-stone-800">
              <button
                onClick={() => setActiveTab('drop')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === 'drop'
                    ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <CloudUpload className="h-4 w-4" />
                <span>{isPt ? '1. Netlify Drop (Mais Fácil)' : '1. Netlify Drop (Easiest)'}</span>
              </button>
              <button
                onClick={() => setActiveTab('github')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === 'github'
                    ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Github className="h-4 w-4" />
                <span>{isPt ? '2. GitHub + Netlify' : '2. GitHub + Netlify'}</span>
              </button>
              <button
                onClick={() => setActiveTab('cli')}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === 'cli'
                    ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>{isPt ? '3. Netlify CLI' : '3. Netlify CLI'}</span>
              </button>
            </div>

            {/* Tab 1: Netlify Drop */}
            {activeTab === 'drop' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    {isPt ? 'Hospedagem em 30 segundos sem precisar de Git' : 'Host in 30 seconds without Git'}
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-stone-300 leading-relaxed">
                    <li>
                      {isPt ? 'Clique no botão acima ' : 'Click the button above '}
                      <strong className="text-teal-300">"{isPt ? 'Baixar Pacote (.zip)' : 'Download Package (.zip)'}"</strong>.
                    </li>
                    <li>
                      {isPt ? 'Abra no seu navegador o site: ' : 'Open in your browser: '}
                      <a 
                        href="https://app.netlify.com/drop" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 font-bold"
                      >
                        app.netlify.com/drop
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      {isPt 
                        ? 'Arraste o arquivo baixado (ou a pasta dist descompactada) diretamente para dentro da página do Netlify.'
                        : 'Drag the downloaded file (or unzipped dist folder) directly into the Netlify Drop page.'}
                    </li>
                    <li>
                      {isPt 
                        ? 'O Netlify fará o upload instantaneamente e entregará o link do seu site HTTPS (ex: https://terraadapt.netlify.app).'
                        : 'Netlify uploads it instantly and gives you a free HTTPS link.'}
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: GitHub + Netlify */}
            {activeTab === 'github' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-white" />
                    {isPt ? 'Deploy Contínuo via Repositório Git' : 'Continuous Deployment via Git Repo'}
                  </h5>
                  <p className="text-stone-300 leading-relaxed">
                    {isPt 
                      ? 'O arquivo netlify.toml já está salvo no projeto. Ao conectar seu repositório no Netlify, ele detecta tudo sozinho:'
                      : 'The netlify.toml is already saved in the repository. When connecting to Netlify, it automatically configures everything:'}
                  </p>
                  
                  <div className="rounded-lg bg-stone-900 border border-stone-800 p-3 font-mono text-[11px] text-stone-300 space-y-1">
                    <div className="text-stone-400"># Configurações lidas do netlify.toml:</div>
                    <div><span className="text-cyan-400">Build command:</span> npm run build</div>
                    <div><span className="text-cyan-400">Publish directory:</span> dist</div>
                    <div><span className="text-cyan-400">Functions:</span> netlify/functions</div>
                  </div>

                  <ol className="list-decimal list-inside space-y-2 text-stone-300 leading-relaxed pt-1">
                    <li>{isPt ? 'Envie este projeto para o seu GitHub.' : 'Push this code to your GitHub.'}</li>
                    <li>
                      {isPt ? 'No Netlify, clique em ' : 'In Netlify, click '}
                      <strong className="text-white">"Add new site" &gt; "Import an existing project"</strong>.
                    </li>
                    <li>{isPt ? 'Escolha o seu repositório e clique em ' : 'Select your repo and click '} <strong className="text-teal-300">Deploy</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 3: CLI */}
            {activeTab === 'cli' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-4 space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                    <Terminal className="h-4 w-4 text-teal-400" />
                    {isPt ? 'Deploy direto pelo Terminal' : 'Deploy directly via Terminal'}
                  </h5>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-[11px]">
                      <span>{isPt ? '1. Compilar para produção:' : '1. Build for production:'}</span>
                      <button
                        onClick={() => copyToClipboard('npm run build', 'build-cmd')}
                        className="text-stone-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'build-cmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'build-cmd' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="rounded-lg bg-stone-950 p-2.5 font-mono text-[11px] text-teal-300 border border-stone-800">
                      npm run build
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-stone-400 text-[11px]">
                      <span>{isPt ? '2. Publicar no Netlify em produção:' : '2. Deploy to production on Netlify:'}</span>
                      <button
                        onClick={() => copyToClipboard('npx netlify deploy --prod --dir=dist', 'deploy-cmd')}
                        className="text-stone-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'deploy-cmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'deploy-cmd' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="rounded-lg bg-stone-950 p-2.5 font-mono text-[11px] text-teal-300 border border-stone-800">
                      npx netlify deploy --prod --dir=dist
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced / Gemini Note */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5 flex items-start gap-3">
            <Cpu className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-stone-400 leading-relaxed">
              <strong className="text-stone-200">
                {isPt ? 'Nota sobre o Consultor de IA e Telemetria:' : 'Note on AI Advisor and Telemetry:'}
              </strong>{' '}
              {isPt 
                ? 'O site funciona 100% de forma autônoma no Netlify! Se desejar conectar o modelo Gemini em tempo real nas funções serverless do Netlify, basta adicionar a variável GEMINI_API_KEY no painel do Netlify (Site Settings > Environment Variables).'
                : 'The site functions 100% autonomously on Netlify! If you want to connect the live Gemini model in Netlify serverless functions, add the GEMINI_API_KEY environment variable in Netlify Site Settings.'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-stone-800 bg-stone-950/70 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <FileCode2 className="h-4 w-4 text-teal-400" />
            <span>{isPt ? 'Build verificado e pronto para servir' : 'Build verified and ready to serve'}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
