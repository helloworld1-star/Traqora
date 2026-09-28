"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, ShieldCheck, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { useWallet, useWalletStore } from "@/lib/stellar-wallet-connect"
import { toast } from "sonner"

export default function WalletConnectScreen() {
  const router = useRouter()
  const { address, isConnected, walletType } = useWalletStore()
  const { handleConnect, handleDisconnect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const onConnectWallet = async () => {
    setIsConnecting(true)
    setAuthError(null)
    try {
      await handleConnect()
      toast.success("Wallet connected successfully via signature verification!")
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate with wallet signature.")
      toast.error("Wallet Connection Failed", { description: err.message })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            SEP-10 Auth Flow
          </Badge>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Wallet className="h-6 w-6" aria-hidden="true" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold">Connect Stellar Wallet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Authenticate securely using cryptographic wallet signatures (Freighter, Albedo, Rabet)
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {isConnected ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-center text-emerald-500 gap-1 font-semibold text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Connected to {walletType || "Stellar Wallet"}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate" title={address}>
                    {address}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/search")}>
                    Continue to Search
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  className="w-full py-6 text-base font-medium"
                  onClick={onConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Signing & Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By connecting your wallet, you agree to Traqora&apos;s Terms of Service and secure signature verification flow.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
