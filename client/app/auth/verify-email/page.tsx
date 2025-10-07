import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a verification link to confirm your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Please check your email and click the verification link to activate your account. You can close this
              window.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
