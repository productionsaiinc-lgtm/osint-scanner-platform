import { useState, useEffect, useRef } from "react";
import { Mail, RefreshCw, Copy, Check, Inbox, Trash2, Eye, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface EmailMessage {
  id: number;
  tempEmailId: number;
  fromAddress: string;
  subject: string;
  body: string;
  htmlBody?: string | null;
  isRead: boolean;
  receivedAt: Date;
}

interface TempEmailAddress {
  id: number;
  userId: number;
  emailAddress: string;
  displayName: string;
  isActive: boolean;
  expiresAt: Date;
  messageCount: number;
  createdAt: Date;
}

export function TempEmail() {
  const [currentEmail, setCurrentEmail] = useState<TempEmailAddress | null>(null);
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<any>(null);

  // tRPC queries and mutations
  const createEmailMutation = trpc.tempEmail.create.useMutation();
  const listEmailsQuery = trpc.tempEmail.listMyEmails.useQuery();
  const messagesQuery = trpc.tempEmail.getMessages.useQuery(
    { tempEmailId: currentEmail?.id || 0 },
    { enabled: !!currentEmail }
  );
  const deleteEmailMutation = trpc.tempEmail.delete.useMutation();
  const deleteMessageMutation = trpc.tempEmail.deleteMessage.useMutation();
  const markReadMutation = trpc.tempEmail.markMessageAsRead.useMutation();
  const simulateEmailMutation = trpc.tempEmail.simulateReceiveEmail.useMutation();

  // Initialize with first email or create new one
  useEffect(() => {
    const initializeEmail = async () => {
      if (listEmailsQuery.data && listEmailsQuery.data.length > 0) {
        setCurrentEmail(listEmailsQuery.data[0]);
      } else if (!currentEmail && !listEmailsQuery.isLoading) {
        const newEmail = await createEmailMutation.mutateAsync({});
        setCurrentEmail(newEmail);
      }
    };
    initializeEmail();
  }, [listEmailsQuery.data]);

  // Update timer based on current email expiry
  useEffect(() => {
    if (!currentEmail) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(currentEmail.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        handleGenerate();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentEmail]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleCopy = () => {
    if (currentEmail) {
      navigator.clipboard.writeText(currentEmail.emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    const newEmail = await createEmailMutation.mutateAsync({});
    setCurrentEmail(newEmail);
    setSelected(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await messagesQuery.refetch();
    setRefreshing(false);
  };

  const handleOpen = async (email: EmailMessage) => {
    setSelected(email);
    if (!email.isRead) {
      await markReadMutation.mutateAsync({ messageId: email.id });
      await messagesQuery.refetch();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMessageMutation.mutateAsync({ messageId: id });
    if (selected?.id === id) setSelected(null);
    await messagesQuery.refetch();
  };

  const handleDeleteEmail = async () => {
    if (currentEmail) {
      await deleteEmailMutation.mutateAsync({ id: currentEmail.id });
      setCurrentEmail(null);
      await listEmailsQuery.refetch();
    }
  };

  const handleSimulateEmail = async () => {
    if (currentEmail) {
      await simulateEmailMutation.mutateAsync({
        tempEmailId: currentEmail.id,
        fromAddress: "noreply@service.io",
        subject: "Your one-time password",
        body: "Your OTP is 392847. Valid for 5 minutes.",
      });
      await messagesQuery.refetch();
    }
  };

  const messages = (messagesQuery.data || []) as any[];
  const unread = messages.filter((m: any) => !m.isRead).length;

  if (!currentEmail) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">Loading temporary email...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-cyan-400 font-mono text-lg font-semibold break-all">{currentEmail.emailAddress}</p>
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
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleSimulateEmail} className="text-gray-400 hover:text-white text-xs" title="Simulate receiving an email">
                  Test
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="text-gray-400 hover:text-white">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {messagesQuery.isLoading ? (
              <div className="text-center py-10 text-gray-600 px-4">
                <p className="text-sm">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-gray-600 px-4">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Waiting for emails...</p>
                <p className="text-xs mt-1">Use the address above to receive emails</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {messages.map((email: any) => (
                  <div
                    key={email.id}
                    onClick={() => handleOpen(email)}
                    className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${selected?.id === email.id ? "bg-gray-800" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!email.isRead && <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                          <p className={`text-sm truncate ${email.isRead ? "text-gray-400" : "text-white font-medium"}`}>{email.fromAddress}</p>
                        </div>
                        <p className={`text-sm truncate mt-0.5 ${email.isRead ? "text-gray-500" : "text-gray-300"}`}>{email.subject}</p>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{email.body.substring(0, 60)}...</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-xs text-gray-600">{new Date(email.receivedAt).toLocaleTimeString()}</p>
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
                  <p className="text-sm"><span className="text-gray-500">From: </span><span className="text-gray-300">{selected.fromAddress}</span></p>
                  <p className="text-sm"><span className="text-gray-500">To: </span><span className="text-gray-300">{currentEmail.emailAddress}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Subject: </span><span className="text-white font-medium">{selected.subject}</span></p>
                  <p className="text-xs text-gray-500">{new Date(selected.receivedAt).toLocaleString()}</p>
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
