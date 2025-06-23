import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Database, Lock, Users, AlertTriangle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2" />
                1. Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nectiq ("we", "us", "our") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our cryptocurrency prediction platform.
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-semibold text-green-800 dark:text-green-200">Our Commitment:</p>
                <p className="text-green-700 dark:text-green-300">
                  We collect only the minimum information necessary to provide our services and never sell your personal data to third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">2.1 Account Information</h4>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Username (required for account identification)</li>
                <li>Password (encrypted and stored securely)</li>
                <li>Email address (if provided for account recovery)</li>
                <li>Account creation date and last login time</li>
              </ul>

              <h4 className="font-semibold">2.2 Platform Activity Data</h4>
              <p>We automatically collect information about your platform usage:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Prediction history (cryptocurrencies, predicted prices, stakes, outcomes)</li>
                <li>Virtual point balance and transaction history</li>
                <li>Reward earnings and accuracy statistics</li>
                <li>Platform navigation and feature usage patterns</li>
                <li>Session duration and frequency of visits</li>
              </ul>

              <h4 className="font-semibold">2.3 Technical Information</h4>
              <p>We collect technical data to ensure platform functionality:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and general location information</li>
                <li>Browser type, version, and operating system</li>
                <li>Device information and screen resolution</li>
                <li>Referral source and navigation paths</li>
                <li>Error logs and performance metrics</li>
              </ul>

              <h4 className="font-semibold">2.4 Cryptocurrency Market Data</h4>
              <p>We access real-time market data for platform functionality:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Current cryptocurrency prices from external APIs</li>
                <li>Historical price data for accuracy calculations</li>
                <li>Market volatility and trend information</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">3.1 Platform Services</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create and manage your user account</li>
                <li>Process and track your predictions</li>
                <li>Calculate accuracy scores and distribute rewards</li>
                <li>Generate leaderboards and ranking systems</li>
                <li>Provide personalized dashboard statistics</li>
              </ul>

              <h4 className="font-semibold">3.2 Platform Improvement</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Analyze user behavior to improve platform features</li>
                <li>Identify and fix technical issues or bugs</li>
                <li>Optimize platform performance and user experience</li>
                <li>Develop new features based on usage patterns</li>
              </ul>

              <h4 className="font-semibold">3.3 Security and Fraud Prevention</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Monitor for suspicious or fraudulent activity</li>
                <li>Prevent unauthorized access to accounts</li>
                <li>Detect and prevent platform abuse or manipulation</li>
                <li>Maintain platform integrity and fair play</li>
              </ul>

              <h4 className="font-semibold">3.4 Communication</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Send important platform updates and notifications</li>
                <li>Respond to user inquiries and support requests</li>
                <li>Notify users of significant changes to terms or policies</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing and Disclosure */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                4. Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">4.1 Public Information</h4>
              <p>The following information may be publicly visible on leaderboards:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Username (never real names or email addresses)</li>
                <li>Total number of predictions made</li>
                <li>Overall accuracy percentage</li>
                <li>Total virtual rewards earned</li>
                <li>Ranking position</li>
              </ul>

              <h4 className="font-semibold">4.2 Third-Party Services</h4>
              <p>We share limited data with essential service providers:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cryptocurrency price data providers (for real-time market information)</li>
                <li>Database hosting services (for secure data storage)</li>
                <li>Analytics services (for platform performance monitoring)</li>
                <li>Security services (for fraud detection and prevention)</li>
              </ul>

              <h4 className="font-semibold">4.3 Legal Requirements</h4>
              <p>We may disclose information when required by law:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>To comply with legal processes or government requests</li>
                <li>To protect our rights, property, or safety</li>
                <li>To protect the rights, property, or safety of our users</li>
                <li>To prevent fraud or illegal activities</li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-800 dark:text-blue-200">Important:</p>
                <p className="text-blue-700 dark:text-blue-300">
                  We never sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2" />
                5. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">5.1 Security Measures</h4>
              <p>We implement multiple layers of security to protect your data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of sensitive data both in transit and at rest</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure database configurations with access controls</li>
                <li>Monitoring for suspicious activities and unauthorized access</li>
              </ul>

              <h4 className="font-semibold">5.2 User Responsibilities</h4>
              <p>Help us keep your account secure by:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Using a strong, unique password for your account</li>
                <li>Not sharing your login credentials with others</li>
                <li>Logging out from shared or public devices</li>
                <li>Reporting any suspicious account activity immediately</li>
              </ul>

              <h4 className="font-semibold">5.3 Data Breach Response</h4>
              <p>In the unlikely event of a data breach:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We will investigate and contain the breach immediately</li>
                <li>Affected users will be notified within 72 hours</li>
                <li>We will provide clear information about what data was affected</li>
                <li>We will take steps to prevent similar incidents in the future</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">6.1 Account Data</h4>
              <p>We retain your account information and prediction history:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>While your account remains active</li>
                <li>For up to 2 years after account deletion (for fraud prevention)</li>
                <li>Anonymized statistical data may be retained indefinitely</li>
              </ul>

              <h4 className="font-semibold">6.2 Technical Logs</h4>
              <p>Technical and security logs are retained for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Error logs: 90 days</li>
                <li>Security logs: 1 year</li>
                <li>Analytics data: 2 years (anonymized)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">7.1 Access and Portability</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request a copy of all personal data we hold about you</li>
                <li>Download your prediction history and statistics</li>
                <li>Receive data in a machine-readable format</li>
              </ul>

              <h4 className="font-semibold">7.2 Correction and Updates</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Update your account information at any time</li>
                <li>Correct any inaccurate personal data</li>
                <li>Request updates to outdated information</li>
              </ul>

              <h4 className="font-semibold">7.3 Deletion</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Delete your account and associated data</li>
                <li>Request removal of specific data (where technically feasible)</li>
                <li>Note: Some data may be retained for legal or security purposes</li>
              </ul>

              <h4 className="font-semibold">7.4 Objection and Restriction</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Object to certain types of data processing</li>
                <li>Request restriction of data processing activities</li>
                <li>Opt out of non-essential data collection</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">8.1 Essential Cookies</h4>
              <p>We use essential cookies for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining your login session</li>
                <li>Remembering your preferences</li>
                <li>Ensuring platform security</li>
                <li>Providing core functionality</li>
              </ul>

              <h4 className="font-semibold">8.2 Analytics Cookies</h4>
              <p>With your consent, we use analytics cookies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Understand how users interact with the platform</li>
                <li>Identify popular features and content</li>
                <li>Measure platform performance</li>
                <li>Improve user experience</li>
              </ul>

              <h4 className="font-semibold">8.3 Managing Cookies</h4>
              <p>You can control cookies through:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Browser settings to block or delete cookies</li>
                <li>Platform preference settings</li>
                <li>Third-party opt-out tools</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. International Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                CryptoPredikt is accessible globally. If you access our platform from outside our primary jurisdiction, please note:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your data may be transferred and processed in different countries</li>
                <li>We comply with applicable international privacy laws</li>
                <li>Data transfers are protected by appropriate safeguards</li>
                <li>Local privacy rights may vary by jurisdiction</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertTriangle className="mr-2" />
                10. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="font-semibold text-orange-800 dark:text-orange-200">Age Restriction:</p>
                <p className="text-orange-700 dark:text-orange-300">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
              </div>
              <p>
                If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
              <p>
                Parents or guardians who believe their child has provided personal information to us should contact our support team immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
              </p>
              <p>When we make changes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We will update the "Last updated" date at the top of this policy</li>
                <li>Significant changes will be communicated through the platform</li>
                <li>Users will be notified via email for material changes (if email provided)</li>
                <li>Continued use of the platform constitutes acceptance of changes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy, want to exercise your privacy rights, or have concerns about how we handle your data, please contact us:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Privacy Contact Information:</h4>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Through our platform support system</li>
                  <li>• Via the contact form on our website</li>
                  <li>• By email through our official support channels</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                We aim to respond to all privacy-related inquiries within 30 days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}