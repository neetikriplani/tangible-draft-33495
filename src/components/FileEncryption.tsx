import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Upload, Download, FileText } from "lucide-react";
import { encryptFile, importKeyFromPEM, downloadText } from "@/lib/crypto";
import { toast } from "sonner";

export const FileEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publicKeyFile, setPublicKeyFile] = useState<File | null>(null);
  const [encryptedEnvelope, setEncryptedEnvelope] = useState<string>("");
  const [sha256Hash, setSha256Hash] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEncryptedEnvelope("");
      setSha256Hash("");
    }
  };

  const handleKeySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPublicKeyFile(file);
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile || !publicKeyFile) {
      toast.error("Please select both a file and a public key");
      return;
    }

    setIsEncrypting(true);
    try {
      // Read public key
      const keyText = await publicKeyFile.text();
      const publicKey = await importKeyFromPEM(keyText, "public");
      
      // Read file data
      const fileData = await selectedFile.arrayBuffer();
      
      // Encrypt
      const envelope = await encryptFile(fileData, selectedFile.name, publicKey);
      
      // Store results
      const envelopeJSON = JSON.stringify(envelope, null, 2);
      setEncryptedEnvelope(envelopeJSON);
      setSha256Hash(envelope.sha256);
      
      toast.success("File encrypted successfully!");
    } catch (error) {
      toast.error("Encryption failed. Check your public key format.");
      console.error(error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const downloadEnvelope = () => {
    if (encryptedEnvelope && selectedFile) {
      downloadText(encryptedEnvelope, `${selectedFile.name}.enc.json`);
      toast.success("Encrypted file downloaded");
    }
  };

  return (
    <Card className="p-6 bg-card border-border border-l-4 border-l-[hsl(270,70%,60%)] card-tilt relative overflow-hidden backdrop-blur">
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[hsl(270,70%,60%)]/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-[hsl(270,70%,60%)]/10 rounded-lg animate-glow-purple">
          <Lock className="w-5 h-5 text-[hsl(270,70%,60%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(270,70%,60%)] to-[hsl(270,70%,75%)] bg-clip-text text-transparent">Encrypt File</h2>
          <p className="text-sm text-muted-foreground">Encrypt a file using hybrid AES-256 + RSA encryption</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(270,70%,70%)]">Select File to Encrypt</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full border-[hsl(270,70%,60%)]/20 hover:border-[hsl(270,70%,60%)] hover:bg-[hsl(270,70%,60%)]/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            {selectedFile ? selectedFile.name : "Choose File"}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(270,70%,70%)]">Select Public Key (.pem)</label>
          <input
            ref={keyInputRef}
            type="file"
            accept=".pem"
            onChange={handleKeySelect}
            className="hidden"
          />
          <Button
            onClick={() => keyInputRef.current?.click()}
            variant="outline"
            className="w-full border-[hsl(270,70%,60%)]/20 hover:border-[hsl(270,70%,60%)] hover:bg-[hsl(270,70%,60%)]/10"
          >
            <FileText className="w-4 h-4 mr-2" />
            {publicKeyFile ? publicKeyFile.name : "Choose Public Key"}
          </Button>
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={!selectedFile || !publicKeyFile || isEncrypting}
          className="w-full bg-[hsl(270,70%,60%)] hover:bg-[hsl(270,70%,55%)] text-white font-semibold shadow-lg hover:shadow-[hsl(270,70%,60%)]/50"
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
            <div className="p-3 bg-[hsl(270,70%,60%)]/10 border border-[hsl(270,70%,60%)]/30 rounded-lg glow-purple">
              <p className="text-sm font-medium text-foreground mb-1">Encryption Complete</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                SHA-256: {sha256Hash}
              </p>
            </div>
            
            <Button
              onClick={downloadEnvelope}
              variant="outline"
              className="w-full border-[hsl(270,70%,60%)]/30 hover:bg-[hsl(270,70%,60%)]/10 hover:border-[hsl(270,70%,60%)]"
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
