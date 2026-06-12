import type { Metadata } from "next";
import { BRAND, TAGLINES, URLS } from "@dropthetop/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND.name} - ${TAGLINES.short}`,
  description: `Review ${BRAND.name}'s Terms of Service. Understand the rules and guidelines for using our Corvette marketplace.`,
  alternates: { canonical: `${URLS.website}/terms` },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title: `Terms of Service | ${BRAND.name}`,
    description: `Review the terms and conditions for using ${BRAND.name}'s Corvette marketplace.`,
    url: `${URLS.website}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pb-16" style={{ paddingTop: "calc(6rem + var(--safe-area-top, 0px))" }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Acceptance of Terms</h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing or using {BRAND.name} ("the Service"), you agree to be bound by these Terms of
                  Service. If you do not agree to these terms, please do not use our platform. We reserve the right
                  to modify these terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Account Registration</h2>
                <div className="space-y-3 text-foreground/80 leading-relaxed">
                  <p>To access certain features, you must create an account. You agree to:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Provide accurate and complete information during registration</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Promptly update your information if it changes</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Listing Guidelines for Sellers</h2>
                <div className="space-y-3 text-foreground/80 leading-relaxed">
                  <p>When listing a Corvette for sale, you must:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Only list Corvettes that you own or are authorized to sell</li>
                    <li>Provide accurate descriptions, specifications, and condition details</li>
                    <li>Use authentic photos of the actual vehicle being sold</li>
                    <li>Disclose all known defects, damage, or issues</li>
                    <li>Provide a valid Vehicle Identification Number (VIN)</li>
                    <li>Set fair and honest pricing</li>
                    <li>Respond promptly to buyer inquiries</li>
                  </ul>
                  <p className="mt-4">
                    All listings are subject to review and approval. We reserve the right to reject or remove
                    listings that violate these guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Buyer Responsibilities</h2>
                <div className="space-y-3 text-foreground/80 leading-relaxed">
                  <p>As a buyer, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Conduct your own due diligence before purchasing</li>
                    <li>Arrange for independent vehicle inspections when appropriate</li>
                    <li>Verify all vehicle information independently</li>
                    <li>Communicate honestly with sellers</li>
                    <li>Complete transactions in good faith</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Prohibited Activities</h2>
                <div className="space-y-3 text-foreground/80 leading-relaxed">
                  <p>You may not use our platform to:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Post fraudulent, misleading, or deceptive listings</li>
                    <li>Engage in any form of harassment or abuse</li>
                    <li>Attempt to circumvent our security measures</li>
                    <li>Use automated systems to scrape or collect data</li>
                    <li>Impersonate others or misrepresent your identity</li>
                    <li>List vehicles other than Corvettes</li>
                    <li>Engage in money laundering or illegal transactions</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Transaction Disclaimer</h2>
                <p className="text-foreground/80 leading-relaxed">
                  {BRAND.name} is a marketplace platform that facilitates connections between buyers and sellers. We
                  are not a party to any transaction between users. All negotiations, agreements, and transactions
                  are solely between buyers and sellers. We do not guarantee the accuracy of listings, the quality
                  of vehicles, or the completion of any transaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Intellectual Property</h2>
                <p className="text-foreground/80 leading-relaxed">
                  All content on our platform, including logos, text, graphics, and software, is the property of{" "}
                  {BRAND.name} or its licensors and is protected by intellectual property laws. You may not
                  reproduce, distribute, or create derivative works without our express permission. By posting
                  content, you grant us a non-exclusive license to use, display, and distribute that content on our
                  platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Limitation of Liability</h2>
                <p className="text-foreground/80 leading-relaxed">
                  To the maximum extent permitted by law, {BRAND.name} and its affiliates shall not be liable for
                  any indirect, incidental, special, consequential, or punitive damages arising from your use of the
                  platform, any transaction between users, or any vehicle purchased through our marketplace. Our
                  total liability shall not exceed the fees paid by you to us in the twelve months preceding the
                  claim.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Indemnification</h2>
                <p className="text-foreground/80 leading-relaxed">
                  You agree to indemnify and hold harmless {BRAND.name}, its officers, directors, employees, and
                  agents from any claims, damages, losses, or expenses arising from your use of the platform, your
                  violation of these terms, or your infringement of any third-party rights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Termination</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for any reason, including
                  violation of these terms. Upon termination, your right to use the platform will immediately cease,
                  and any pending listings may be removed. Provisions that by their nature should survive
                  termination shall remain in effect.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Governing Law</h2>
                <p className="text-foreground/80 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of the
                  United States. Any disputes arising under these terms shall be resolved in the state and federal
                  courts located within our jurisdiction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at{" "}
                  <a href={`mailto:${URLS.email.legal}`} className="text-primary hover:underline">
                    {URLS.email.legal}
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
