import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Upload, Download, Eye, EyeOff } from "lucide-react";
import { encryptFileWithPassword, downloadText } from "@/lib/crypto";
import { calculatePasswordStrength, PasswordStrength } from "@/lib/passwordStrength";
import { toast } from "sonner";

export const PasswordFileEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [encryptedEnvelope, setEncryptedEnvelope] = useState<string>("");
  const [sha256Hash, setSha256Hash] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordStrengthResult = password ? calculatePasswordStrength(password) : null;

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'high': return 'text-[hsl(142,76%,45%)]';
      case 'medium': return 'text-[hsl(45,93%,47%)]';
      case 'low': return 'text-destructive';
    }
  };

  const getStrengthBgColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'high': return 'bg-[hsl(142,76%,45%)]';
      case 'medium': return 'bg-[hsl(45,93%,47%)]';
      case 'low': return 'bg-destructive';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEncryptedEnvelope("");
      setSha256Hash("");
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsEncrypting(true);
    try {
      // Read file data
      const fileData = await selectedFile.arrayBuffer();
      
      // Encrypt
      const envelope = await encryptFileWithPassword(fileData, selectedFile.name, password);
      
      // Store results
      const envelopeJSON = JSON.stringify(envelope, null, 2);
      setEncryptedEnvelope(envelopeJSON);
      setSha256Hash(envelope.sha256);
      
      toast.success("File encrypted successfully!");
    } catch (error) {
      toast.error("Encryption failed");
      console.error(error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const downloadEnvelope = () => {
    if (encryptedEnvelope && selectedFile) {
      downloadText(encryptedEnvelope, `${selectedFile.name}.pwd.json`);
      toast.success("Encrypted file downloaded");
    }
  };

  return (
    <Card className="p-6 bg-card border-border border-l-4 border-l-[hsl(45,93%,47%)] card-tilt relative overflow-hidden backdrop-blur">
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[hsl(45,93%,47%)]/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-[hsl(45,93%,47%)]/10 rounded-lg">
          <Lock className="w-5 h-5 text-[hsl(45,93%,47%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(45,93%,57%)] bg-clip-text text-transparent">Password Encryption</h2>
          <p className="text-sm text-muted-foreground">Encrypt a file using a password</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(45,93%,50%)]">Select File to Encrypt</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full border-[hsl(45,93%,47%)]/20 hover:border-[hsl(45,93%,47%)] hover:bg-[hsl(45,93%,47%)]/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            {selectedFile ? selectedFile.name : "Choose File"}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(45,93%,50%)]">Enter Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="pr-10 border-[hsl(45,93%,47%)]/20 focus:border-[hsl(45,93%,47%)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {passwordStrengthResult && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getStrengthBgColor(passwordStrengthResult.strength)}`}
                    style={{ width: `${passwordStrengthResult.score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${getStrengthColor(passwordStrengthResult.strength)}`}>
                  {passwordStrengthResult.strength.toUpperCase()}
                </span>
              </div>
              {passwordStrengthResult.feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {passwordStrengthResult.feedback.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={!selectedFile || !password || isEncrypting}
          className="w-full bg-[hsl(45,93%,47%)] hover:bg-[hsl(45,93%,42%)] text-white font-semibold shadow-lg hover:shadow-[hsl(45,93%,47%)]/50"
        >
          {isEncrypting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Encrypting...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Encrypt File
            </>
          )}
        </Button>

        {encryptedEnvelope && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-[hsl(45,93%,47%)]/10 border border-[hsl(45,93%,47%)]/30 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Encryption Complete</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                SHA-256: {sha256Hash}
              </p>
            </div>
            
            <Button
              onClick={downloadEnvelope}
              variant="outline"
              className="w-full border-[hsl(45,93%,47%)]/30 hover:bg-[hsl(45,93%,47%)]/10 hover:border-[hsl(45,93%,47%)]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Encrypted File
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
