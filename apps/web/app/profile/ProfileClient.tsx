"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  User,
  Mail,
  Calendar,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { US_STATES } from "@dropthetop/shared";

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-primary" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const s = getPasswordStrength(password);
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className={`h-1 flex-1 rounded-full transition-colors ${lvl <= s.score ? s.color : "bg-muted"}`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${
          s.score <= 1
            ? "text-destructive"
            : s.score === 2
            ? "text-amber-500"
            : s.score === 3
            ? "text-primary"
            : "text-emerald-500"
        }`}
      >
        {s.label}
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  dealer_name: string | null;
  phone: string | null;
  address: string | null;
  location_city: string | null;
  location_state: string | null;
  zip_code: string | null;
  website: string | null;
  bio: string | null;
  contact_email: string | null;
  is_dealer: boolean | null;
  created_at: string | null;
}

interface Props {
  userId: string;
  userEmail: string;
  isVerified: boolean;
  profile: ProfileData | null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ProfileClient({ userId, userEmail, isVerified, profile: initialProfile }: Props) {
  const [profile, setProfile] = useState<ProfileData>(
    initialProfile ?? {
      first_name: "",
      last_name: "",
      dealer_name: "",
      phone: "",
      address: "",
      location_city: "",
      location_state: "",
      zip_code: "",
      website: "",
      bio: "",
      contact_email: "",
      is_dealer: false,
      created_at: null,
    }
  );

  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

  const isDealer = !!profile.is_dealer;

  // ── phone formatter ──────────────────────────────────────────────────────────
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // ── resend verification email ─────────────────────────────────────────────────
  const handleResendVerification = async () => {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: userEmail });
    setResending(false);
    if (error) {
      toast.error("Failed to resend. Please try again.");
    } else {
      toast.success("Verification email sent — check your inbox.");
    }
  };

  // ── save profile ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!profile.first_name?.trim()) {
      toast.error("First name is required.");
      return;
    }
    if (!profile.last_name?.trim()) {
      toast.error("Last name is required.");
      return;
    }
    if (isDealer && !profile.dealer_name?.trim()) {
      toast.error("Dealer name is required for dealer accounts.");
      return;
    }
    if (!profile.location_city?.trim()) {
      toast.error("City is required.");
      return;
    }
    if (!profile.location_state?.trim()) {
      toast.error("State is required.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        dealer_name: profile.dealer_name?.trim() || null,
        phone: profile.phone || null,
        address: profile.address?.trim() || null,
        location_city: profile.location_city.trim(),
        location_state: profile.location_state.trim(),
        zip_code: profile.zip_code?.trim() || null,
        website: profile.website?.trim() || null,
        bio: profile.bio || null,
        contact_email: profile.contact_email || null,
      })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile.");
    } else {
      toast.success("Profile updated.");
    }
  };

  // ── change password ──────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated.");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  };

  return (
    <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
      <div className="container mx-auto px-4 pb-12 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl">My Profile</h1>
            {isVerified && (
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                Verified
              </Badge>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving} className="btn-racing gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">

          {/* ── Email verification banner ─────────────────────────────────── */}
          {!isVerified && (
            <div className="glass-card rounded-lg p-5 border-2 border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h2 className="font-display text-lg">Verify Your Email</h2>
                <Badge className="ml-auto bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
                  Required
                </Badge>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Please verify your email to unlock full marketplace access — contacting sellers, making offers, and creating listings.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={resending}
                className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resending ? "Sending…" : "Resend Verification Email"}
              </Button>
            </div>
          )}

          {/* ── Account info ──────────────────────────────────────────────── */}
          <section className="glass-card rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-accent" />
              <h2 className="font-display text-xl">Account Information</h2>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Login Email</p>
                <p className="font-medium text-sm">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Seller Type</p>
                {isDealer ? (
                  <Badge className="bg-accent/20 text-accent border-accent/30 mt-0.5">Dealer</Badge>
                ) : (
                  <Badge variant="outline" className="mt-0.5">Private Owner</Badge>
                )}
              </div>
            </div>

            {profile.created_at && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium text-sm">
                    {format(new Date(profile.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ── Personal information ──────────────────────────────────────── */}
          <section className="glass-card rounded-lg p-5 space-y-4">
            <h2 className="font-display text-xl">Personal Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={profile.first_name ?? ""}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={profile.last_name ?? ""}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>

            {isDealer && (
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  Dealer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={profile.dealer_name ?? ""}
                  onChange={(e) => setProfile({ ...profile, dealer_name: e.target.value })}
                  placeholder="Dealership name"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed on your listings instead of your personal name.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                Contact Email
              </Label>
              <Input
                type="email"
                value={profile.contact_email ?? ""}
                onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                placeholder="contact@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Used for marketplace communications. Leave blank to use your login email.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                Phone Number
              </Label>
              <Input
                type="tel"
                value={profile.phone ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: formatPhone(e.target.value) })
                }
                placeholder="555-123-4567"
                maxLength={12}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                Address
              </Label>
              <Input
                value={profile.address ?? ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-5 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={profile.location_city ?? ""}
                  onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                  placeholder="Nashville"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={profile.location_state ?? ""}
                  onValueChange={(v: string | null) =>
                    setProfile({ ...profile, location_state: v ?? "" })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                  ZIP
                </Label>
                <Input
                  value={profile.zip_code ?? ""}
                  onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
                  placeholder="37201"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                Website
              </Label>
              <Input
                type="url"
                value={profile.website ?? ""}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                Bio
              </Label>
              <Textarea
                value={profile.bio ?? ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself…"
                rows={3}
                className="resize-none"
                maxLength={500}
              />
            </div>
          </section>

          {/* ── Change password ───────────────────────────────────────────── */}
          <section className="glass-card rounded-lg p-5">
            {!showPasswordForm ? (
              <Button
                variant="outline"
                className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-accent" />
                  <h2 className="font-display text-xl">Change Password</h2>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <PasswordStrengthIndicator password={passwordData.newPassword} />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      className="pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {passwordData.confirmPassword &&
                        passwordData.newPassword === passwordData.confirmPassword && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                      setShowNew(false);
                      setShowConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 btn-racing gap-2"
                    onClick={handleChangePassword}
                    disabled={
                      savingPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {savingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
