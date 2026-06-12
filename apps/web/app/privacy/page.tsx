import type { Metadata } from "next";
import { BRAND, TAGLINES, URLS } from "@dropthetop/shared";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND.name} - ${TAGLINES.short}`,
  description: `Read ${BRAND.name}'s Privacy Policy. Learn how we collect, use, and protect your personal information on our Corvette marketplace.`,
  alternates: { canonical: `${URLS.website}/privacy` },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    title: `Privacy Policy | ${BRAND.name}`,
    description: `Learn how ${BRAND.name} collects, uses, and protects your personal information.`,
    url: `${URLS.website}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pb-16" style={{ paddingTop: "calc(6rem + var(--safe-area-top, 0px))" }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Introduction</h2>
                <p className="text-foreground/80 leading-relaxed">
                  {BRAND.name} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your information when you visit our website
                  and use our Corvette marketplace services.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Information We Collect</h2>
                <div className="space-y-4 text-foreground/80 leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                    <p>
                      When you register for an account or list a vehicle, we may collect your name, email address,
                      phone number, and location information.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Listing Information</h3>
                    <p>
                      Information about vehicles you list for sale, including photos, descriptions, pricing, and
                      vehicle identification numbers (VIN).
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                    <p>
                      We automatically collect information about how you interact with our platform, including pages
                      visited, listings viewed, and search queries.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cookies and Tracking</h3>
                    <p>
                      We use cookies and similar technologies to enhance your experience, analyze usage patterns, and
                      deliver personalized content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 leading-relaxed">
                  <li>To provide and maintain our marketplace services</li>
                  <li>To process transactions and facilitate communication between buyers and sellers</li>
                  <li>To send you important updates about your account and listings</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To detect and prevent fraud or unauthorized access</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Information Sharing</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 leading-relaxed">
                  <li>
                    <strong>With other users:</strong> Seller contact information is shared with interested buyers
                    when they inquire about a listing
                  </li>
                  <li>
                    <strong>Service providers:</strong> Third-party vendors who help us operate our platform (email
                    services, analytics, hosting)
                  </li>
                  <li>
                    <strong>Legal requirements:</strong> When required by law or to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Data Security</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of
                  transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Your Rights and Choices</h2>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 leading-relaxed">
                  <li>
                    <strong>Access:</strong> You can access and update your personal information through your account
                    settings
                  </li>
                  <li>
                    <strong>Deletion:</strong> You may request deletion of your account and associated data
                  </li>
                  <li>
                    <strong>Communications:</strong> You can opt out of promotional emails while still receiving
                    essential account notifications
                  </li>
                  <li>
                    <strong>Cookies:</strong> You can manage cookie preferences through your browser settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Children&apos;s Privacy</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                  personal information from children.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Changes to This Policy</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-foreground mb-4">Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
                  <a href={`mailto:${URLS.email.privacy}`} className="text-primary hover:underline">
                    {URLS.email.privacy}
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
