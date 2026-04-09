/**
 * VPN Connection Database Helpers
 * Manages VPN connections, status, and connection logs
 */

import { getDb } from "./db";

// VPN Connection Status
export type VPNConnectionStatus = "disconnected" | "connecting" | "connected" | "disconnecting" | "error";

// VPN Connection interface
export interface VPNConnection {
  id: string;
  providerId: string;
  status: VPNConnectionStatus;
  connectedAt?: Date;
  disconnectedAt?: Date;
  serverLocation: string;
  protocol: string;
  encryptionLevel: string;
  ipAddress: string;
  originalIP: string;
  dataUsed: number; // bytes
  uploadSpeed: number; // Mbps
  downloadSpeed: number; // Mbps
  ping: number; // ms
  killSwitchEnabled: boolean;
  leakDetected: boolean;
}

// VPN Connection Log
export interface VPNConnectionLog {
  id: string;
  providerId: string;
  action: "connect" | "disconnect" | "reconnect" | "error" | "leak_detected";
  timestamp: Date;
  details: string;
  status: "success" | "failed" | "warning";
}

// In-memory connection store (in production, use database)
let currentConnection: VPNConnection | null = null;
const connectionLogs: VPNConnectionLog[] = [];

/**
 * Connect to VPN
 */
export async function connectVPN(providerId: string, serverLocation: string, protocol: string): Promise<VPNConnection> {
  // Simulate connection
  const connection: VPNConnection = {
    id: `vpn-${Date.now()}`,
    providerId,
    status: "connecting",
    serverLocation,
    protocol,
    encryptionLevel: "AES-256",
    ipAddress: "0.0.0.0", // Will be updated
    originalIP: "203.0.113.42",
    dataUsed: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    ping: 0,
    killSwitchEnabled: true,
    leakDetected: false,
  };

  // Simulate connection process
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Update connection status
  connection.status = "connected";
  connection.connectedAt = new Date();
  connection.ipAddress = generateVPNIP();
  connection.downloadSpeed = 85 + Math.random() * 20;
  connection.uploadSpeed = 70 + Math.random() * 15;
  connection.ping = 15 + Math.random() * 25;

  currentConnection = connection;

  // Log connection
  await logConnection(providerId, "connect", "Successfully connected to VPN", "success");

  return connection;
}

/**
 * Disconnect from VPN
 */
export async function disconnectVPN(): Promise<void> {
  if (!currentConnection) {
    throw new Error("No active VPN connection");
  }

  const providerId = currentConnection.providerId;

  // Simulate disconnection
  currentConnection.status = "disconnecting";
  await new Promise((resolve) => setTimeout(resolve, 1000));

  currentConnection.status = "disconnected";
  currentConnection.disconnectedAt = new Date();

  // Log disconnection
  await logConnection(providerId, "disconnect", "Successfully disconnected from VPN", "success");

  currentConnection = null;
}

/**
 * Get current VPN connection status
 */
export async function getVPNStatus(): Promise<VPNConnection | null> {
  return currentConnection;
}

/**
 * Reconnect to VPN
 */
export async function reconnectVPN(): Promise<VPNConnection> {
  if (!currentConnection) {
    throw new Error("No VPN connection to reconnect");
  }

  const { providerId, serverLocation, protocol } = currentConnection;

  // Log reconnection attempt
  await logConnection(providerId, "reconnect", "Attempting to reconnect to VPN", "success");

  // Disconnect and reconnect
  await disconnectVPN();
  return await connectVPN(providerId, serverLocation, protocol);
}

/**
 * Enable/Disable kill switch
 */
export async function setKillSwitch(enabled: boolean): Promise<void> {
  if (currentConnection) {
    currentConnection.killSwitchEnabled = enabled;
    const status = enabled ? "enabled" : "disabled";
    await logConnection(
      currentConnection.providerId,
      "connect",
      `Kill switch ${status}`,
      "success"
    );
  }
}

/**
 * Check for IP/DNS leaks
 */
export async function checkForLeaks(): Promise<{
  hasLeak: boolean;
  leakType?: string;
  details: string;
}> {
  if (!currentConnection) {
    return {
      hasLeak: false,
      details: "No active VPN connection",
    };
  }

  // Simulate leak detection
  const leakChance = Math.random();

  if (leakChance < 0.05) {
    // 5% chance of detecting a leak
    currentConnection.leakDetected = true;
    await logConnection(
      currentConnection.providerId,
      "leak_detected",
      "DNS leak detected - enable kill switch",
      "warning"
    );

    return {
      hasLeak: true,
      leakType: "DNS",
      details: "DNS leak detected. Your DNS queries may be visible.",
    };
  }

  currentConnection.leakDetected = false;
  return {
    hasLeak: false,
    details: "No leaks detected - your connection is secure",
  };
}

/**
 * Get connection logs
 */
export async function getConnectionLogs(limit: number = 50): Promise<VPNConnectionLog[]> {
  return connectionLogs.slice(-limit).reverse();
}

/**
 * Clear connection logs
 */
export async function clearConnectionLogs(): Promise<void> {
  connectionLogs.length = 0;
}

/**
 * Get connection statistics
 */
export async function getConnectionStats(): Promise<{
  totalConnections: number;
  totalDataUsed: number;
  averagePing: number;
  connectionTime: number | null;
}> {
  const connectLogs = connectionLogs.filter((log) => log.action === "connect" && log.status === "success");
  const totalConnections = connectLogs.length;

  let totalDataUsed = 0;
  let totalPing = 0;

  if (currentConnection) {
    totalDataUsed = currentConnection.dataUsed;
    totalPing = currentConnection.ping;
  }

  const connectionTime = currentConnection && currentConnection.connectedAt
    ? Date.now() - currentConnection.connectedAt.getTime()
    : null;

  return {
    totalConnections,
    totalDataUsed,
    averagePing: totalPing,
    connectionTime,
  };
}

/**
 * Update connection data usage
 */
export async function updateDataUsage(bytes: number): Promise<void> {
  if (currentConnection) {
    currentConnection.dataUsed += bytes;
  }
}

/**
 * Log connection event
 */
async function logConnection(
  providerId: string,
  action: VPNConnectionLog["action"],
  details: string,
  status: "success" | "failed" | "warning"
): Promise<void> {
  const log: VPNConnectionLog = {
    id: `log-${Date.now()}`,
    providerId,
    action,
    timestamp: new Date(),
    details,
    status,
  };

  connectionLogs.push(log);

  // Keep only last 100 logs
  if (connectionLogs.length > 100) {
    connectionLogs.shift();
  }
}

/**
 * Generate random VPN IP address
 */
function generateVPNIP(): string {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

/**
 * Format data size
 */
export function formatDataSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format connection time
 */
export function formatConnectionTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
