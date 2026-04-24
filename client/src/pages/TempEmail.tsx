import { useState, useEffect, useRef } from "react";
import { Mail, RefreshCw, Copy, Check, Inbox, Trash2, Eye, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: Date;
  read: boolean;
}

const DOMAINS = ["tempmail.osint", "burner.osint", "anon.osint"];

const SAMPLE_EMAILS: Email[] = [
  {
    id: "1",
    from: "noreply@github.com",
    subject: "Verify your email address",
    preview: "Please verify the email address associated with your GitHub account...",
    body: "Please verify the email address associated with your GitHub account by clicking the link below:\n\nhttps://github.com/users/verify?token=abc123xyz\n\nThis link will expire in 24 hours.\n\nIf you did not create a GitHub account, you can ignore this email.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 2),
    read: false,
  },
  {
    id: "2",
    from: "security@accounts.google.com",
    subject: "Your verification code is 847291",
    preview: "Use this code to sign in to your Google Account. Never share this code with anyone.",
    body: "Your Google verification code is:\n\n847291\n\nDo not share this code with anyone. Google will never ask for this code.\n\nThis code expires in 10 minutes.",
    receivedAt: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
];

function generateAddress() {
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const name = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${name}@${domain}`;
}

export function TempEmail() {
  const [address, setAddress] = useState(() => generateAddress());
  const [emails, setEmails] = useState<Email[]>(SAMPLE_EMAILS);
  const [selected, setSelected] = useState<Email | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleGenerate();
          return 600;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setAddress(generateAddress());
    setEmails([]);
    setSelected(null);
    setTimeLeft(600);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    // Simulate new incoming email occasionally
    if (Math.random() > 0.5) {
      const newEmail: Email = {
        id: Date.now().toString(),
        from: "no-reply@service.io",
        subject: "Your one-time password",
        preview: "Your OTP is 392847. Valid for 5 minutes.",
        body: "Your one-time password is:\n\n392847\n\nThis code is valid for 5 minutes. Do not share it with anyone.",
        receivedAt: new Date(),
        read: false,
      };
      setEmails(prev => [newEmail, ...prev]);
    }
    setRefreshing(false);
  };

  const handleOpen = (email: Email) => {
    setSelected(email);
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
  };

  const handleDelete = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const unread = emails.filter(e => !e.read).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
          <Mail className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Temporary Email</h1>
          <p className="text-sm text-gray-400">Disposable inbox for anonymous registrations & OSINT ops</p>
        </div>
      </div>

      {/* Address bar */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Active Inbox</span>
                <Badge variant="outline" className="text-yellow-400 border-yellow-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" />Expires in {formatTime(timeLeft)}
                </Badge>
              </div>
              <p className="text-cyan-400 font-mono text-lg font-semibold break-all">{address}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={handleCopy} className="border-gray-600 text-gray-300 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate} className="border-gray-600 text-gray-300 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-1" />New
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Email list */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                Inbox
                {unread > 0 && (
                  <Badge className="bg-cyan-600 text-white text-xs">{unread}</Badge>
                )}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="text-gray-400 hover:text-white">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {emails.length === 0 ? (
              <div className="text-center py-10 text-gray-600 px-4">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Waiting for emails...</p>
                <p className="text-xs mt-1">Use the address above to receive emails</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {emails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => handleOpen(email)}
                    className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${selected?.id === email.id ? "bg-gray-800" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!email.read && <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                          <p className={`text-sm truncate ${email.read ? "text-gray-400" : "text-white font-medium"}`}>{email.from}</p>
                        </div>
                        <p className={`text-sm truncate mt-0.5 ${email.read ? "text-gray-500" : "text-gray-300"}`}>{email.subject}</p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{email.preview}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-xs text-gray-600">{email.receivedAt.toLocaleTimeString()}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); handleDelete(email.id); }}
                          className="w-6 h-6 p-0 text-gray-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email reader */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Message Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-center py-10 text-gray-600">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select an email to read it</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1 border-b border-gray-700 pb-3">
                  <p className="text-sm"><span className="text-gray-500">From: </span><span className="text-gray-300">{selected.from}</span></p>
                  <p className="text-sm"><span className="text-gray-500">To: </span><span className="text-gray-300">{address}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Subject: </span><span className="text-white font-medium">{selected.subject}</span></p>
                  <p className="text-xs text-gray-500">{selected.receivedAt.toLocaleString()}</p>
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{selected.body}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
