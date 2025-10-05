import { Shield } from "lucide-react";
import { KeyGeneration } from "@/components/KeyGeneration";
import { FileEncryption } from "@/components/FileEncryption";
import { FileDecryption } from "@/components/FileDecryption";

const Index = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(195,100%,50%)]/10 via-[hsl(270,70%,60%)]/10 to-[hsl(142,76%,45%)]/10 blur-3xl" />
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            <div className="p-4 bg-gradient-to-br from-[hsl(195,100%,50%)]/20 via-[hsl(270,70%,60%)]/20 to-[hsl(142,76%,45%)]/20 rounded-2xl animate-glow-cyan border border-[hsl(195,100%,50%)]/30">
              <Shield className="w-12 h-12 text-[hsl(195,100%,50%)]" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[hsl(195,100%,50%)] via-[hsl(270,70%,60%)] to-[hsl(142,76%,45%)] bg-clip-text text-transparent relative">
            Secure File Storage
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto relative">
            Hybrid cryptography using AES-256-GCM + RSA-OAEP with SHA-256 fingerprinting for secure file encryption and decryption
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <KeyGeneration />
          </div>
          
          <div className="lg:col-span-1">
            <FileEncryption />
          </div>
          
          <div className="lg:col-span-1">
            <FileDecryption />
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(195,100%,50%)]/5 rounded-full blur-3xl" />
            <h2 className="text-2xl font-bold mb-6 relative bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(270,70%,60%)] bg-clip-text text-transparent">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-sm relative">
              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(195,100%,50%)]/20 to-[hsl(195,100%,50%)]/5 text-[hsl(195,100%,50%)] flex items-center justify-center text-base font-bold border border-[hsl(195,100%,50%)]/30 group-hover:glow-cyan transition-all">1</div>
                  <h3 className="font-bold text-base">Generate Keys</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Create a 2048-bit RSA key pair. Download both keys - share the public key, keep the private key secure.
                </p>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(270,70%,60%)]/20 to-[hsl(270,70%,60%)]/5 text-[hsl(270,70%,60%)] flex items-center justify-center text-base font-bold border border-[hsl(270,70%,60%)]/30 group-hover:glow-purple transition-all">2</div>
                  <h3 className="font-bold text-base">Encrypt</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Upload a file and recipient's public key. Get an encrypted JSON envelope with SHA-256 fingerprint.
                </p>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(142,76%,45%)]/20 to-[hsl(142,76%,45%)]/5 text-[hsl(142,76%,45%)] flex items-center justify-center text-base font-bold border border-[hsl(142,76%,45%)]/30 group-hover:glow-green transition-all">3</div>
                  <h3 className="font-bold text-base">Decrypt</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Upload encrypted envelope and your private key to recover the original file with integrity verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-destructive/10 border-l-4 border-l-destructive border-t border-r border-b border-destructive/30 rounded-xl p-5 text-center relative overflow-hidden backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent" />
            <p className="text-sm text-destructive-foreground relative">
              <strong className="text-base">⚠️ Security Warning:</strong> Never share your private key. All encryption happens in your browser - no data is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
