import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Unlock, Upload, Download, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import { decryptFileWithPassword, downloadBinary, PasswordEncryptedEnvelope } from "@/lib/crypto";
import { toast } from "sonner";

export const PasswordFileDecryption = () => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [envelopeFile, setEnvelopeFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  const [decryptedFilename, setDecryptedFilename] = useState<string>("");
  const [sha256Valid, setSha256Valid] = useState<boolean>(false);
  
  const envelopeInputRef = useRef<HTMLInputElement>(null);

  const handleEnvelopeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEnvelopeFile(file);
      setDecryptedData(null);
    }
  };

  const handleDecrypt = async () => {
    if (!envelopeFile) {
      toast.error("Please select an encrypted file");
      return;
    }

    if (!password) {
      toast.error("Please enter the password");
      return;
    }

    setIsDecrypting(true);
    try {
      // Read envelope
      const envelopeText = await envelopeFile.text();
      const envelope: PasswordEncryptedEnvelope = JSON.parse(envelopeText);
      
      // Decrypt
      const result = await decryptFileWithPassword(envelope, password);
      
      // Store results
      setDecryptedData(result.data);
      setDecryptedFilename(result.filename);
      setSha256Valid(result.sha256Valid);
      
      if (result.sha256Valid) {
        toast.success("File decrypted successfully! SHA-256 verified.");
      } else {
        toast.error("File decrypted but SHA-256 verification failed!");
      }
    } catch (error) {
      toast.error("Decryption failed. Check your password or file.");
      console.error(error);
    } finally {
      setIsDecrypting(false);
    }
  };

  const downloadDecrypted = () => {
    if (decryptedData && decryptedFilename) {
      downloadBinary(decryptedData, decryptedFilename);
      toast.success("Decrypted file downloaded");
    }
  };

  return (
    <Card className="p-6 bg-card border-border border-l-4 border-l-[hsl(45,93%,47%)] card-tilt relative overflow-hidden backdrop-blur">
      <div className="absolute top-0 right-1/2 w-36 h-36 bg-[hsl(45,93%,47%)]/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-[hsl(45,93%,47%)]/10 rounded-lg">
          <Unlock className="w-5 h-5 text-[hsl(45,93%,47%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(45,93%,47%)] to-[hsl(45,93%,57%)] bg-clip-text text-transparent">Password Decryption</h2>
          <p className="text-sm text-muted-foreground">Decrypt a password-protected file</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(45,93%,50%)]">Select Encrypted File (.pwd.json)</label>
          <input
            ref={envelopeInputRef}
            type="file"
            accept=".json,.pwd.json"
            onChange={handleEnvelopeSelect}
            className="hidden"
          />
          <Button
            onClick={() => envelopeInputRef.current?.click()}
            variant="outline"
            className="w-full border-[hsl(45,93%,47%)]/20 hover:border-[hsl(45,93%,47%)] hover:bg-[hsl(45,93%,47%)]/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            {envelopeFile ? envelopeFile.name : "Choose Encrypted File"}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(45,93%,50%)]">Enter Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password"
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
        </div>

        <Button
          onClick={handleDecrypt}
          disabled={!envelopeFile || !password || isDecrypting}
          className="w-full bg-[hsl(45,93%,47%)] hover:bg-[hsl(45,93%,42%)] text-white font-semibold shadow-lg hover:shadow-[hsl(45,93%,47%)]/50"
        >
          {isDecrypting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Decrypting...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Decrypt File
            </>
          )}
        </Button>

        {decryptedData && (
          <div className="space-y-3 pt-2">
            <div className={`p-3 border rounded-lg ${sha256Valid ? 'bg-[hsl(142,76%,45%)]/10 border-[hsl(142,76%,45%)]/30' : 'bg-destructive/10 border-destructive/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {sha256Valid ? (
                  <>
                    <Check className="w-4 h-4 text-[hsl(142,76%,45%)]" />
                    <p className="text-sm font-medium text-foreground">Decryption Successful</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive-foreground">SHA-256 Verification Failed</p>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                File: {decryptedFilename} ({(decryptedData.length / 1024).toFixed(2)} KB)
              </p>
            </div>
            
            <Button
              onClick={downloadDecrypted}
              variant="outline"
              className="w-full border-[hsl(45,93%,47%)]/30 hover:bg-[hsl(45,93%,47%)]/10 hover:border-[hsl(45,93%,47%)]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Decrypted File
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
