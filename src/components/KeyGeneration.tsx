import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Download, Check } from "lucide-react";
import { generateRSAKeyPair, exportKeyToPEM, downloadText } from "@/lib/crypto";
import { toast } from "sonner";

export const KeyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [publicKeyPEM, setPublicKeyPEM] = useState<string>("");
  const [privateKeyPEM, setPrivateKeyPEM] = useState<string>("");

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    try {
      const keyPair = await generateRSAKeyPair();
      const publicPEM = await exportKeyToPEM(keyPair.publicKey, "public");
      const privatePEM = await exportKeyToPEM(keyPair.privateKey, "private");
      
      setPublicKeyPEM(publicPEM);
      setPrivateKeyPEM(privatePEM);
      setKeysGenerated(true);
      
      toast.success("RSA key pair generated successfully!");
    } catch (error) {
      toast.error("Failed to generate keys. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPublicKey = () => {
    downloadText(publicKeyPEM, "public.pem");
    toast.success("Public key downloaded");
  };

  const downloadPrivateKey = () => {
    downloadText(privateKeyPEM, "private.pem");
    toast.success("Private key downloaded - Keep this safe!");
  };

  return (
    <Card className="p-6 bg-card border-border border-l-4 border-l-[hsl(195,100%,50%)] card-tilt relative overflow-hidden backdrop-blur">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(195,100%,50%)]/5 rounded-full blur-3xl" />
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-[hsl(195,100%,50%)]/10 rounded-lg animate-glow-cyan">
          <KeyRound className="w-5 h-5 text-[hsl(195,100%,50%)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(195,100%,70%)] bg-clip-text text-transparent">Generate RSA Keys</h2>
          <p className="text-sm text-muted-foreground">Create a new 2048-bit RSA key pair</p>
        </div>
      </div>

      {!keysGenerated ? (
        <Button 
          onClick={handleGenerateKeys} 
          disabled={isGenerating}
          className="w-full bg-[hsl(195,100%,50%)] hover:bg-[hsl(195,100%,45%)] text-[hsl(220,25%,8%)] font-semibold shadow-lg hover:shadow-[hsl(195,100%,50%)]/50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-[hsl(220,25%,8%)]/30 border-t-[hsl(220,25%,8%)] rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4 mr-2" />
              Generate Key Pair
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3 relative">
          <div className="flex items-center gap-2 p-3 bg-[hsl(195,100%,50%)]/10 border border-[hsl(195,100%,50%)]/30 rounded-lg glow-cyan">
            <Check className="w-5 h-5 text-[hsl(195,100%,50%)]" />
            <span className="text-sm text-foreground">Keys generated successfully</span>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={downloadPublicKey}
              variant="outline"
              className="w-full border-[hsl(195,100%,50%)]/30 hover:bg-[hsl(195,100%,50%)]/10 hover:border-[hsl(195,100%,50%)]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Public Key
            </Button>
            
            <Button 
              onClick={downloadPrivateKey}
              variant="outline"
              className="w-full border-destructive/50 hover:bg-destructive/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Private Key (Keep Safe!)
            </Button>
          </div>
          
          <Button 
            onClick={() => {
              setKeysGenerated(false);
              setPublicKeyPEM("");
              setPrivateKeyPEM("");
            }}
            variant="ghost"
            className="w-full hover:bg-[hsl(195,100%,50%)]/10"
          >
            Generate New Keys
          </Button>
        </div>
      )}
    </Card>
  );
};
