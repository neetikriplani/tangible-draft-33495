import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Unlock, Upload, Download, FileText, AlertTriangle, Check } from "lucide-react";
import { decryptFile, importKeyFromPEM, downloadBinary, EncryptedEnvelope } from "@/lib/crypto";
import { toast } from "sonner";

export const FileDecryption = () => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [envelopeFile, setEnvelopeFile] = useState<File | null>(null);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  const [decryptedFilename, setDecryptedFilename] = useState<string>("");
  const [sha256Valid, setSha256Valid] = useState<boolean>(false);
  
  const envelopeInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const handleEnvelopeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEnvelopeFile(file);
      setDecryptedData(null);
    }
  };

  const handleKeySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrivateKeyFile(file);
    }
  };

  const handleDecrypt = async () => {
    if (!envelopeFile || !privateKeyFile) {
      toast.error("Please select both an encrypted file and a private key");
      return;
    }

    setIsDecrypting(true);
    try {
      // Read private key
      const keyText = await privateKeyFile.text();
      const privateKey = await importKeyFromPEM(keyText, "private");
      
      // Read envelope
      const envelopeText = await envelopeFile.text();
      const envelope: EncryptedEnvelope = JSON.parse(envelopeText);
      
      // Decrypt
      const result = await decryptFile(envelope, privateKey);
      
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
      toast.error("Decryption failed. Check your private key or envelope file.");
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
    <Card className="p-6 bg-card border-border border-l-4 border-l-[hsl(142,76%,45%)] card-tilt relative overflow-hidden backdrop-blur">
      <div className="absolute top-0 left-1/2 w-36 h-36 bg-[hsl(142,76%,45%)]/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-[hsl(142,76%,45%)]/10 rounded-lg animate-glow-green">
          <Unlock className="w-5 h-5 text-[hsl(142,76%,45%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(142,76%,45%)] to-[hsl(142,76%,60%)] bg-clip-text text-transparent">Decrypt File</h2>
          <p className="text-sm text-muted-foreground">Decrypt an encrypted envelope using your private key</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(142,76%,50%)]">Select Encrypted File (.enc.json)</label>
          <input
            ref={envelopeInputRef}
            type="file"
            accept=".json,.enc.json"
            onChange={handleEnvelopeSelect}
            className="hidden"
          />
          <Button
            onClick={() => envelopeInputRef.current?.click()}
            variant="outline"
            className="w-full border-[hsl(142,76%,45%)]/20 hover:border-[hsl(142,76%,45%)] hover:bg-[hsl(142,76%,45%)]/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            {envelopeFile ? envelopeFile.name : "Choose Encrypted File"}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(142,76%,50%)]">Select Private Key (.pem)</label>
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
            className="w-full border-[hsl(142,76%,45%)]/20 hover:border-[hsl(142,76%,45%)] hover:bg-[hsl(142,76%,45%)]/10"
          >
            <FileText className="w-4 h-4 mr-2" />
            {privateKeyFile ? privateKeyFile.name : "Choose Private Key"}
          </Button>
        </div>

        <Button
          onClick={handleDecrypt}
          disabled={!envelopeFile || !privateKeyFile || isDecrypting}
          className="w-full bg-[hsl(142,76%,45%)] hover:bg-[hsl(142,76%,40%)] text-white font-semibold shadow-lg hover:shadow-[hsl(142,76%,45%)]/50"
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
            <div className={`p-3 border rounded-lg ${sha256Valid ? 'bg-[hsl(142,76%,45%)]/10 border-[hsl(142,76%,45%)]/30 glow-green' : 'bg-destructive/10 border-destructive/20'}`}>
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
              className="w-full border-[hsl(142,76%,45%)]/30 hover:bg-[hsl(142,76%,45%)]/10 hover:border-[hsl(142,76%,45%)]"
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
