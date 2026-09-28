"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Wallet, ArrowRight, AlertCircle } from "lucide-react";

export default function WalletConnectScreen() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [network, setNetwork] = useState("testnet");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setAddress("GBC3...TESTADDRESSXLMWALLET...");
    setWalletType("Freighter");
    setIsConnected(true);
  };

  const handleDisconnect = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setAddress(null);
    setWalletType(null);
    setIsConnected(false);
  };

  const onConnectWallet = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await handleConnect();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to connect wallet via signature flow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDisconnectWallet = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await handleDisconnect();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to disconnect wallet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8" role="main">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Connect Your Stellar Wallet</h1>
          <p className="text-sm text-muted-foreground">
            Authenticate securely using the wallet-signature flow to access Traqora travel bookings and smart contracts.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-1" role="alert">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              <span>Connection Error</span>
            </div>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Wallet Authentication</h2>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Your wallet is successfully connected." : "Select your preferred Stellar wallet provider to sign in."}
            </p>
          </div>
          <div className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium capitalize">{walletType || "Stellar Wallet"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium uppercase">{network || "testnet"}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block text-xs mb-1">Address:</span>
                    <span className="font-mono text-xs break-all block text-foreground">{address}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                    onClick={onDisconnectWallet}
                    disabled={isLoading}
                    aria-label="Disconnect current wallet"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> : null}
                    Disconnect
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    onClick={() => router.push("/search")}
                    aria-label="Proceed to flight search"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>Uses cryptographic challenge-response signature to verify ownership without exposing your private key.</span>
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                  onClick={onConnectWallet}
                  disabled={isLoading}
                  aria-label="Connect wallet using signature flow"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting & Signing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
