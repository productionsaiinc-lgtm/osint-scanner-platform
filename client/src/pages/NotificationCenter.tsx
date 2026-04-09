import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Settings,
  Trash2,
  Archive,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  Volume2,
  Mail,
  Smartphone,
  Search,
  Filter,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'scan_complete' | 'vulnerability' | 'subscription' | 'payout' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  icon?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Scan Complete',
      message: 'Network scan on 192.168.1.0/24 completed successfully',
      type: 'scan_complete',
      priority: 'medium',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      title: 'Vulnerability Found',
      message: 'Critical CVE-2024-1234 detected on target system',
      type: 'vulnerability',
      priority: 'critical',
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      title: 'Payout Received',
      message: 'Your affiliate payout of $150.00 has been processed',
      type: 'payout',
      priority: 'high',
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 3600000),
    },
  ]);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleArchive = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/10 border-green-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scan_complete':
        return '✓';
      case 'vulnerability':
        return '⚠';
      case 'subscription':
        return '$';
      case 'payout':
        return '💰';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notification Center
          </h1>
          <p className="text-gray-400 mt-2">Manage and customize your notifications</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleMarkAllAsRead}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="border-cyan-500/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Notifications</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Unread</div>
            <div className="text-2xl font-bold text-red-400 mt-2">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">High Priority</div>
            <div className="text-2xl font-bold text-yellow-400 mt-2">
              {notifications.filter((n) => n.priority === 'high' || n.priority === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Read</div>
            <div className="text-2xl font-bold text-green-400 mt-2">
              {notifications.filter((n) => n.isRead).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-cyan-500/30 bg-black/40 text-cyan-400"
              />
            </div>
            <Button variant="outline" className="border-cyan-500/30">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'scan_complete', 'vulnerability', 'subscription', 'payout'].map((type) => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                variant={filterType === type ? 'default' : 'outline'}
                className={filterType === type ? 'bg-cyan-600' : 'border-cyan-500/30'}
              >
                {type === 'all' ? 'All' : type.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-400">
              No notifications found matching your filters
            </AlertDescription>
          </Alert>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-l-4 transition ${
                notification.isRead
                  ? 'border-gray-500/30 bg-black/20'
                  : 'border-l-cyan-400 bg-black/40 border-gray-500/30'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`text-2xl mt-1 flex items-center justify-center w-10 h-10 rounded ${getPriorityColor(
                        notification.priority
                      )}`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority.toUpperCase()}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 ml-auto"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchive(notification.id)}
                      className="text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-purple-400">Notification Preferences</CardTitle>
            <CardDescription>Customize how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Channels
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    In-App Notifications
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Push Notifications
                  </span>
                </label>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="font-semibold text-white mb-3">Notification Types</h3>
              <div className="space-y-2">
                {[
                  { label: 'Scan Complete', key: 'scan_complete' },
                  { label: 'Vulnerability Found', key: 'vulnerability' },
                  { label: 'Subscription Updates', key: 'subscription' },
                  { label: 'Payout Received', key: 'payout' },
                  { label: 'System Alerts', key: 'system' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Frequency */}
            <div>
              <h3 className="font-semibold text-white mb-3">Frequency</h3>
              <div className="space-y-2">
                {['Immediate', 'Daily Digest', 'Weekly Digest', 'Never'].map((freq) => (
                  <label key={freq} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="frequency" defaultChecked={freq === 'Immediate'} className="w-4 h-4" />
                    <span className="text-sm text-gray-300">{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sound & Vibration */}
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Sound & Vibration
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Enable notification sound</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Enable vibration</span>
                </label>
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h3 className="font-semibold text-white mb-3">Quiet Hours</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Enable quiet hours</span>
                </label>
                <div className="flex gap-2 ml-7">
                  <Input
                    type="time"
                    placeholder="Start time"
                    className="border-cyan-500/30 bg-black/40 text-cyan-400"
                  />
                  <Input
                    type="time"
                    placeholder="End time"
                    className="border-cyan-500/30 bg-black/40 text-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Save Preferences</Button>
              <Button variant="outline" className="border-cyan-500/30">
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-400">
          Customize your notification preferences to stay informed about important events while minimizing distractions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
