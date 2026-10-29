"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, ShieldCheck, HelpCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export default function PaymentStatusScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || searchParams.get("id")

  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const checkStatus = async () => {
    setStatus("loading")
    setErrorMessage(null)
    try {
      if (!bookingId) {
        setStatus("pending")
        return;
      }
      const res = await apiClient.getBooking(bookingId)
      if (res.success && res.data) {
        const bookingStatus = res.data.status
        setTxHash(res.data.sorobanTxHash || null)
        if (bookingStatus === "confirmed" || bookingStatus === "paid") {
          setStatus("success")
        } else if (bookingStatus === "failed") {
          setStatus("failed")
          setErrorMessage(res.data.lastError || "Transaction failed on the Stellar network.")
        } else {
          setStatus("pending")
        }
      } else {
        setStatus("pending")
      }
    } catch (err: any) {
      setStatus("failed")
      setErrorMessage(err.message || "Failed to verify payment status.")
    }
  }

  useEffect(() => {
    checkStatus()
  }, [bookingId])

  const handleRetry = async () => {
    setIsRetrying(true)
    toast.info("Retrying payment settlement...")
    try {
      await checkStatus()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/search")}>
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Search
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Stellar Settlement
          </Badge>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="font-serif text-2xl font-bold">
              Payment & Booking Status
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tracking transaction settlement on the Soroban smart contract
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4" aria-live="polite">
                <Loader2 className="h-12 w-12 text-primary animate-spin" aria-hidden="true" />
                <p className="text-muted-foreground font-medium">Verifying transaction status...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Payment Confirmed Successfully!</h2>
                  <p className="text-sm text-muted-foreground">
                    Your flight booking has been securely settled on the Stellar network.
                  </p>
                  {txHash && (
                    <p className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded truncate">
                      TxHash: {txHash}
                    </p>
                  )}
                </div>
                <Button className="w-full" onClick={() => router.push("/dashboard")}>
                  View My Bookings
                </Button>
              </div>
            )}

            {status === "pending" && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <RefreshCw className="h-16 w-16 text-amber-500 animate-spin" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Transaction Pending Confirmation</h2>
                  <p className="text-sm text-muted-foreground">
                    Your transaction has been submitted to Soroban and is awaiting ledger consensus.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleRetry} disabled={isRetrying}>
                    {isRetrying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Refresh Status
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Settlement Failed</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "The transaction failed to process correctly on-chain."}
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Retry Guidance & Troubleshooting
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Ensure your wallet has sufficient XLM for network fees.</li>
                    <li>Check if your session or signature expired and reconnect your wallet.</li>
                    <li>Verify network connectivity to the Stellar Testnet / Mainnet RPC.</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleRetry} disabled={isRetrying}>
                    {isRetrying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Retry Payment
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/search")}>
                    Return to Search
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
