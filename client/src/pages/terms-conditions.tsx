import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, Scale, Users } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using Nectiq.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Acceptance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="mr-2" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Nectiq ("the Platform", "we", "us", "our"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service. These terms apply to all visitors, users, and others who access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* Platform Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2" />
                2. Platform Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nectiq is a gamified cryptocurrency price prediction platform designed for entertainment and educational purposes only. The platform allows users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Make predictions about cryptocurrency price movements</li>
                <li>Stake virtual points on their predictions</li>
                <li>Earn rewards based on prediction accuracy</li>
                <li>Compete with other users on leaderboards</li>
                <li>Track their prediction performance over time</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Important:</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  All activities on this platform involve virtual points only. No real money or cryptocurrency is involved in the prediction activities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                3. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">3.1 Account Creation</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Users must provide accurate and complete information when creating an account</li>
                <li>Users are responsible for maintaining the security of their account credentials</li>
                <li>Users must not share their account with others</li>
              </ul>

              <h4 className="font-semibold">3.2 Acceptable Use</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the platform only for lawful purposes and in accordance with these terms</li>
                <li>Not attempt to manipulate the platform or exploit any bugs or vulnerabilities</li>
                <li>Not use automated systems or bots to make predictions</li>
                <li>Not engage in any form of harassment or abuse toward other users</li>
                <li>Not attempt to reverse engineer or copy the platform</li>
              </ul>

              <h4 className="font-semibold">3.3 Prohibited Activities</h4>
              <p>Users must not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create multiple accounts to gain unfair advantages</li>
                <li>Share strategies or coordinate predictions with other users</li>
                <li>Use the platform for any illegal activities</li>
                <li>Attempt to hack, damage, or disrupt the platform</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Virtual Points and Rewards */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Virtual Points and Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">4.1 Virtual Currency</h4>
              <p>
                All points, stakes, and rewards on the platform are virtual and have no real-world monetary value. They cannot be exchanged for real money, cryptocurrency, or any other valuable consideration.
              </p>

              <h4 className="font-semibold">4.2 Reward Distribution</h4>
              <p>
                Rewards are calculated based on prediction accuracy according to our tiered system:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Perfect predictions (≥99.5%): 3x stake amount</li>
                <li>Excellent predictions (≥95%): 2x stake amount</li>
                <li>Good predictions (≥90%): 1.5x stake amount</li>
                <li>Poor predictions (more than ±5%): 0x stake amount</li>
              </ul>

              <h4 className="font-semibold">4.3 Point Balance</h4>
              <p>
                We reserve the right to adjust user point balances in cases of suspected fraud, technical errors, or violations of these terms.
              </p>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We collect and process user data in accordance with our Privacy Policy. By using the platform, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              <p>
                We use real-time cryptocurrency price data from external APIs for prediction verification. This data is used solely for platform functionality and is not stored permanently.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="mr-2" />
                6. Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">6.1 Educational Purpose Only</h4>
                <p className="text-red-700 dark:text-red-300">
                  This platform is designed for entertainment and educational purposes only. It is not intended to provide financial advice or encourage real cryptocurrency trading.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">6.2 No Financial Advice</h4>
                <p className="text-red-700 dark:text-red-300">
                  Nothing on this platform constitutes financial, investment, trading, or other types of advice. Users should not make real investment decisions based on activities or results from this platform.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">6.3 Market Volatility</h4>
                <p className="text-red-700 dark:text-red-300">
                  Cryptocurrency markets are extremely volatile and unpredictable. Past performance on this platform does not indicate future success in real trading.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Availability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Platform Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We strive to maintain platform availability but do not guarantee uninterrupted service. The platform may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scheduled maintenance</li>
                <li>Technical difficulties</li>
                <li>Third-party service outages</li>
                <li>Force majeure events</li>
              </ul>
              <p>
                We are not liable for any losses or inconvenience caused by service interruptions.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The platform, including its design, code, content, and trademarks, is owned by Nectiq and protected by intellectual property laws.
              </p>
              <p>
                Users are granted a limited, non-exclusive, non-transferable license to use the platform for its intended purpose only.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, Nectiq and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use or inability to use the platform</li>
                <li>Any errors or omissions in the platform content</li>
                <li>Unauthorized access to user accounts</li>
                <li>Technical failures or data loss</li>
                <li>Any investment decisions made based on platform activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to terminate or suspend user accounts at our discretion, particularly in cases of:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violation of these terms and conditions</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Technical misuse of the platform</li>
                <li>Inactive accounts (after reasonable notice)</li>
              </ul>
              <p>
                Users may terminate their account at any time by contacting our support team.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes through the platform or email.
              </p>
              <p>
                Continued use of the platform after changes constitutes acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These terms shall be governed by and construed in accordance with applicable international law regarding online platforms and services.
              </p>
              <p>
                Any disputes arising from these terms or platform use shall be resolved through appropriate legal channels.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms & Conditions, please contact us through our support channels available on the platform.
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  By using Nectiq, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}