"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || searchParams.get("id");
  const initialStatus = searchParams.get("status") || "pending";

  const [status, setStatus] = useState<"success" | "failed" | "pending">(
    initialStatus === "success" || initialStatus === "failed" ? initialStatus : "pending"
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialStatus === "failed" ? "Transaction settlement failed on the Stellar network or was rejected." : null
  );

  useEffect(() => {
    if (initialStatus) {
      if (initialStatus === "success") setStatus("success");
      else if (initialStatus === "failed") setStatus("failed");
      else setStatus("pending");
    }
  }, [initialStatus]);

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    setErrorMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("success");
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(err?.message || "Retry failed. Please verify your wallet balance and network connectivity.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8" role="main">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Search
          </button>
        </div>

        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="text-center space-y-2">
            {status === "success" && (
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2" aria-hidden="true">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}
            {status === "failed" && (
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2" aria-hidden="true">
                <XCircle className="w-10 h-10" />
              </div>
            )}
            {status === "pending" && (
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2" aria-hidden="true">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            )}

            <h1 className="text-2xl font-serif font-bold">
              {status === "success" && "Payment Settled Successfully"}
              {status === "failed" && "Payment Settlement Failed"}
              {status === "pending" && "Processing Payment..."}
            </h1>
            <p className="text-sm text-muted-foreground">
              {status === "success" && "Your booking has been secured on the Stellar / Soroban blockchain."}
              {status === "failed" && "We encountered an issue finalizing your transaction on Stellar network."}
              {status === "pending" && "Please wait while we confirm your transaction on-chain."}
            </p>
          </div>

          <div className="space-y-6">
            {bookingId && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm flex justify-between items-center">
                <span className="text-muted-foreground">Booking Reference:</span>
                <span className="font-mono font-medium text-foreground">{bookingId}</span>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-1" role="alert">
                  <div className="flex items-center space-x-2 font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Retry Guidance</span>
                  </div>
                  <p className="text-sm">
                    {errorMessage || "Ensure your wallet has sufficient XLM for fees and USDC/native tokens for settlement. Check network congestion or try again."}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    onClick={handleRetryPayment}
                    disabled={isRetrying}
                    aria-label="Retry payment settlement"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Retrying Settlement...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Payment
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                    onClick={() => router.push("/search")}
                  >
                    Return to Flight Search
                  </button>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-800 dark:text-green-200 space-y-1">
                  <div className="flex items-center space-x-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Confirmed on Stellar</span>
                  </div>
                  <p className="text-sm">
                    Your smart contract execution completed successfully. Booking details have been recorded.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 py-2.5 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                    onClick={() => router.push("/dashboard")}
                  >
                    View Dashboard
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                    onClick={() => router.push(bookingId ? `/book/${bookingId}` : "/search")}
                  >
                    View Booking
                  </button>
                </div>
              </div>
            )}

            {status === "pending" && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Do not close this window while the transaction is being verified on the ledger.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentStatusScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
