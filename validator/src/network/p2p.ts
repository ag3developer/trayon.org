/**
 * P2P Network with libp2p
 * Handles peer-to-peer networking between Trayon validators
 * Uses libp2p for peer discovery, messaging, and gossip protocol
 */

import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { kadDHT } from '@libp2p/kad-dht';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { identifyService } from 'libp2p/identify';
import { pingService } from 'libp2p/ping';
import { EventEmitter } from 'events';
import Logger from '../utils/logger';

interface P2PConfig {
  port: number;
  host: string;
  bootstrapNodes: string[];
  maxConnections?: number;
  minConnections?: number;
}

interface Peer {
  id: string;
  address: string;
  port: number;
  connected: boolean;
  lastSeen: Date;
  latency?: number;
}

interface NetworkMessage {
  type: string;
  from: string;
  data: any;
  timestamp: number;
  signature?: string;
}

class P2PNetwork extends EventEmitter {
  private logger: Logger;
  private config: P2PConfig;
  private libp2p: any;
  private peers: Map<string, Peer> = new Map();
  private isConnected: boolean = false;
  private messageHandlers: Map<string, Function> = new Map();
  private gossipsubTopic: string = '/trayon/consensus/1.0.0';

  constructor(config: P2PConfig) {
    super();
    this.logger = new Logger('P2PNetwork');
    this.config = {
      maxConnections: 30,
      minConnections: 5,
      ...config,
    };
    this.setupMessageHandlers();
  }

  /**
   * Initialize and start P2P network
   */
  async start(): Promise<void> {
    try {
      this.logger.info(`🌐 Starting P2P network on ${this.config.host}:${this.config.port}`);

      // Create libp2p instance with PBFT-optimized settings
      this.libp2p = await createLibp2p({
        addresses: {
          listen: [
            `/ip4/${this.config.host}/tcp/${this.config.port}`,
          ],
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        peerDiscovery: [
          kadDHT({
            clientMode: false,
            kBucketSize: 20,
          }),
        ],
        pubsub: gossipsub({
          emitSelf: false,
          floodPublish: false,
          mcacheLength: 8,
          mcacheGossip: 3,
          fanoutTTL: 60000,
          heartbeatInterval: 1000,
        }),
        services: {
          identify: identifyService(),
          ping: pingService(),
        },
      });

      // Register event listeners
      this.libp2p.addEventListener('peer:connect', (evt: any) =>
        this.onPeerConnect(evt)
      );
      this.libp2p.addEventListener('peer:disconnect', (evt: any) =>
        this.onPeerDisconnect(evt)
      );

      // Start the libp2p node
      await this.libp2p.start();
      this.logger.info(`✅ libp2p started with peer ID: ${this.libp2p.peerId}`);

      // Subscribe to consensus gossip topic
      await this.subscribeToConsensus();

      // Connect to bootstrap nodes
      await this.connectToBootstrapNodes();

      this.isConnected = true;
      this.logger.info('✅ P2P network fully operational');
      this.emit('ready');
    } catch (error) {
      this.logger.error('❌ Error starting P2P network:', error);
      throw error;
    }
  }

  /**
   * Stop P2P network
   */
  async stop(): Promise<void> {
    try {
      if (this.libp2p) {
        await this.libp2p.services.pubsub.unsubscribe(this.gossipsubTopic);
        await this.libp2p.stop();
        this.isConnected = false;
        this.logger.info('✅ P2P network stopped');
      }
    } catch (error) {
      this.logger.error('Error stopping P2P network:', error);
    }
  }

  /**
   * Connect to bootstrap nodes
   */
  private async connectToBootstrapNodes(): Promise<void> {
    const { multiaddr } = await import('@multiformats/multiaddr');
    for (const bootstrap of this.config.bootstrapNodes) {
      try {
        const addr = multiaddr(bootstrap);
        await this.libp2p.dial(addr);
        this.logger.info(`✅ Connected to bootstrap node: ${bootstrap}`);
      } catch (error) {
        this.logger.warn(`⚠️ Failed to connect to bootstrap: ${bootstrap}`);
      }
    }
  }

  /**
   * Subscribe to consensus gossip topic
   */
  private async subscribeToConsensus(): Promise<void> {
    try {
      await this.libp2p.services.pubsub.subscribe(this.gossipsubTopic);
      this.libp2p.services.pubsub.addEventListener('message', (evt: any) => {
        this.onGossipMessage(evt);
      });
      this.logger.info(`✅ Subscribed to consensus topic: ${this.gossipsubTopic}`);
    } catch (error) {
      this.logger.error('Error subscribing to consensus:', error);
    }
  }

  /**
   * Handle peer connection
   */
  private async onPeerConnect(evt: any): Promise<void> {
    const peerId = evt.detail.toString();
    this.logger.info(`👤 Peer connected: ${peerId}`);

    const peer: Peer = {
      id: peerId,
      address: 'unknown',
      port: 0,
      connected: true,
      lastSeen: new Date(),
    };
    this.peers.set(peerId, peer);

    this.emit('peer:connected', { peerId, peerCount: this.peers.size });

    if (this.peers.size < (this.config.minConnections || 5)) {
      this.triggerPeerDiscovery();
    }
  }

  /**
   * Handle peer disconnection
   */
  private onPeerDisconnect(evt: any): Promise<void> {
    const peerId = evt.detail.toString();
    this.logger.warn(`👤 Peer disconnected: ${peerId}`);

    this.peers.delete(peerId);
    this.emit('peer:disconnected', { peerId, peerCount: this.peers.size });

    return Promise.resolve();
  }

  /**
   * Trigger peer discovery
   */
  private async triggerPeerDiscovery(): Promise<void> {
    try {
      if (this.libp2p.services.dht) {
        const randomId = Math.random().toString(36).substring(7);
        const peers = await this.libp2p.services.dht.findProviders(randomId, {
          timeout: 5000,
        });
        this.logger.info(`🔍 Peer discovery found ${peers.length} candidates`);
      }
    } catch (error) {
      this.logger.debug('Peer discovery error (non-critical)');
    }
  }

  /**
   * Handle gossip message from consensus
   */
  private onGossipMessage(evt: any): void {
    try {
      const message: NetworkMessage = JSON.parse(
        new TextDecoder().decode(evt.detail.data)
      );

      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
        this.emit('message:received', message);
      } else {
        this.logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.logger.error('Error processing gossip message:', error);
    }
  }

  /**
   * Broadcast consensus message
   */
  async broadcastConsensusMessage(message: NetworkMessage): Promise<void> {
    try {
      const payload = JSON.stringify(message);
      await this.libp2p.services.pubsub.publish(
        this.gossipsubTopic,
        new TextEncoder().encode(payload)
      );
      this.logger.debug(`📤 Broadcasted ${message.type} to ${this.peers.size} peers`);
    } catch (error) {
      this.logger.error('Error broadcasting message:', error);
      throw error;
    }
  }

  /**
   * Send direct message to peer
   */
  async sendDirectMessage(peerId: string, message: NetworkMessage): Promise<void> {
    try {
      this.logger.debug(`📨 Sending direct message to peer: ${peerId}`);
    } catch (error) {
      this.logger.error(`Error sending message to peer ${peerId}:`, error);
    }
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    this.messageHandlers.set('pre-prepare', (msg: NetworkMessage) => {
      this.emit('consensus:pre-prepare', msg.data);
    });
    this.messageHandlers.set('prepare', (msg: NetworkMessage) => {
      this.emit('consensus:prepare', msg.data);
    });
    this.messageHandlers.set('commit', (msg: NetworkMessage) => {
      this.emit('consensus:commit', msg.data);
    });
    this.messageHandlers.set('view-change', (msg: NetworkMessage) => {
      this.emit('consensus:view-change', msg.data);
    });
    this.messageHandlers.set('block-proposal', (msg: NetworkMessage) => {
      this.emit('consensus:block-proposal', msg.data);
    });
  }

  /**
   * Get connected peers
   */
  getConnectedPeers(): Peer[] {
    return Array.from(this.peers.values()).filter((p) => p.connected);
  }

  /**
   * Get peer count
   */
  getPeerCount(): number {
    return this.peers.size;
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return {
      isConnected: this.isConnected,
      peerId: this.libp2p?.peerId?.toString(),
      connectedPeers: this.getConnectedPeers().length,
      totalKnownPeers: this.peers.size,
      gossipsubTopic: this.gossipsubTopic,
      isOperational: this.isNetworkConnected(),
    };
  }

  /**
   * Check if network is fully operational
   */
  isNetworkConnected(): boolean {
    return this.isConnected && this.peers.size >= (this.config.minConnections || 5);
  }

  /**
   * Check if P2P is connected
   */
  isP2PConnected(): boolean {
    return this.isConnected;
  }
}

export default P2PNetwork;
