import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyGeneration } from "@/components/KeyGeneration";
import { FileEncryption } from "@/components/FileEncryption";
import { FileDecryption } from "@/components/FileDecryption";
import { PasswordFileEncryption } from "@/components/PasswordFileEncryption";
import { PasswordFileDecryption } from "@/components/PasswordFileDecryption";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
            Hybrid RSA encryption or password-based AES-256-GCM encryption with SHA-256 fingerprinting for secure file protection
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <Tabs defaultValue="rsa" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="rsa">RSA Encryption</TabsTrigger>
            <TabsTrigger value="password">Password Encryption</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rsa">
            <div className="grid lg:grid-cols-3 gap-6">
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
          </TabsContent>
          
          <TabsContent value="password">
            <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="lg:col-span-1">
                <PasswordFileEncryption />
              </div>
              
              <div className="lg:col-span-1">
                <PasswordFileDecryption />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(195,100%,50%)]/5 rounded-full blur-3xl" />
            <h2 className="text-2xl font-bold mb-6 relative bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(270,70%,60%)] bg-clip-text text-transparent">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm relative mb-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-[hsl(195,100%,50%)]">RSA Encryption</h3>
                <div className="space-y-3">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(195,100%,50%)]/20 to-[hsl(195,100%,50%)]/5 text-[hsl(195,100%,50%)] flex items-center justify-center text-sm font-bold border border-[hsl(195,100%,50%)]/30">1</div>
                      <h4 className="font-bold text-sm">Generate Keys</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Create a 2048-bit RSA key pair. Share the public key, keep the private key secure.
                    </p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(270,70%,60%)]/20 to-[hsl(270,70%,60%)]/5 text-[hsl(270,70%,60%)] flex items-center justify-center text-sm font-bold border border-[hsl(270,70%,60%)]/30">2</div>
                      <h4 className="font-bold text-sm">Encrypt</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Upload file and recipient's public key. Get encrypted JSON envelope.
                    </p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(142,76%,45%)]/20 to-[hsl(142,76%,45%)]/5 text-[hsl(142,76%,45%)] flex items-center justify-center text-sm font-bold border border-[hsl(142,76%,45%)]/30">3</div>
                      <h4 className="font-bold text-sm">Decrypt</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Upload envelope and private key to recover the original file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-[hsl(45,93%,47%)]">Password Encryption</h3>
                <div className="space-y-3">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(45,93%,47%)]/20 to-[hsl(45,93%,47%)]/5 text-[hsl(45,93%,47%)] flex items-center justify-center text-sm font-bold border border-[hsl(45,93%,47%)]/30">1</div>
                      <h4 className="font-bold text-sm">Choose Password</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Create a strong password. The strength indicator helps you choose securely.
                    </p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(45,93%,47%)]/20 to-[hsl(45,93%,47%)]/5 text-[hsl(45,93%,47%)] flex items-center justify-center text-sm font-bold border border-[hsl(45,93%,47%)]/30">2</div>
                      <h4 className="font-bold text-sm">Encrypt</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Upload file and enter password. File is encrypted with AES-256-GCM.
                    </p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(45,93%,47%)]/20 to-[hsl(45,93%,47%)]/5 text-[hsl(45,93%,47%)] flex items-center justify-center text-sm font-bold border border-[hsl(45,93%,47/)]/30">3</div>
                      <h4 className="font-bold text-sm">Decrypt</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-11">
                      Upload encrypted file and enter password to decrypt.
                    </p>
                  </div>
                </div>
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
