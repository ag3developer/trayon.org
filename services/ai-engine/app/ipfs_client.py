"""IPFS client wrapper for document storage and retrieval."""

import json
import logging
from typing import Optional, Dict, Any
import ipfshttpclient
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class IPFSClient:
    """Wrapper around ipfshttpclient for Trayon document storage."""
    
    def __init__(self, api_url: str = "/ip4/127.0.0.1/tcp/5001"):
        """Initialize IPFS client."""
        self.api_url = api_url
        self.client: Optional[ipfshttpclient.Client] = None
        self._connect()
    
    def _connect(self):
        """Establish connection to IPFS node."""
        try:
            self.client = ipfshttpclient.connect(self.api_url)
            logger.info(f"✓ Connected to IPFS at {self.api_url}")
        except Exception as e:
            logger.error(f"Failed to connect to IPFS: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def add_dict(self, data: Dict[str, Any]) -> str:
        """
        Store a Python dictionary on IPFS.
        
        Args:
            data: Dictionary to store
            
        Returns:
            IPFS hash (CID)
        """
        try:
            json_str = json.dumps(data, indent=2)
            ipfs_hash = self.client.add_str(json_str)
            logger.info(f"Stored dict on IPFS: {ipfs_hash}")
            return ipfs_hash
        except Exception as e:
            logger.error(f"Failed to add dict to IPFS: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def add_json(self, json_str: str) -> str:
        """Store JSON string on IPFS."""
        try:
            ipfs_hash = self.client.add_str(json_str)
            logger.info(f"Stored JSON on IPFS: {ipfs_hash}")
            return ipfs_hash
        except Exception as e:
            logger.error(f"Failed to add JSON to IPFS: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def add_bytes(self, data: bytes) -> str:
        """Store bytes on IPFS."""
        try:
            ipfs_hash = self.client.add_bytes(data)
            logger.info(f"Stored bytes on IPFS: {ipfs_hash}")
            return ipfs_hash
        except Exception as e:
            logger.error(f"Failed to add bytes to IPFS: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_dict(self, ipfs_hash: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve dictionary from IPFS.
        
        Args:
            ipfs_hash: IPFS hash/CID
            
        Returns:
            Retrieved dictionary or None
        """
        try:
            json_str = self.client.cat(ipfs_hash).decode()
            data = json.loads(json_str)
            logger.info(f"Retrieved dict from IPFS: {ipfs_hash}")
            return data
        except Exception as e:
            logger.error(f"Failed to get dict from IPFS: {str(e)}")
            return None
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_json(self, ipfs_hash: str) -> Optional[str]:
        """Retrieve JSON string from IPFS."""
        try:
            json_str = self.client.cat(ipfs_hash).decode()
            logger.info(f"Retrieved JSON from IPFS: {ipfs_hash}")
            return json_str
        except Exception as e:
            logger.error(f"Failed to get JSON from IPFS: {str(e)}")
            return None
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def add_file(self, file_path: str) -> str:
        """
        Store a file on IPFS.
        
        Args:
            file_path: Path to file
            
        Returns:
            IPFS hash
        """
        try:
            with open(file_path, 'rb') as f:
                ipfs_hash = self.client.add_bytes(f.read())
            logger.info(f"Stored file on IPFS: {ipfs_hash} ({file_path})")
            return ipfs_hash
        except Exception as e:
            logger.error(f"Failed to add file to IPFS: {str(e)}")
            raise
    
    def pin_hash(self, ipfs_hash: str) -> bool:
        """
        Pin a hash on IPFS (ensure persistence).
        
        Args:
            ipfs_hash: Hash to pin
            
        Returns:
            True if successful
        """
        try:
            self.client.pin.add(ipfs_hash)
            logger.info(f"Pinned on IPFS: {ipfs_hash}")
            return True
        except Exception as e:
            logger.error(f"Failed to pin hash: {str(e)}")
            return False
    
    def unpin_hash(self, ipfs_hash: str) -> bool:
        """
        Unpin a hash from IPFS.
        
        Args:
            ipfs_hash: Hash to unpin
            
        Returns:
            True if successful
        """
        try:
            self.client.pin.rm(ipfs_hash)
            logger.info(f"Unpinned from IPFS: {ipfs_hash}")
            return True
        except Exception as e:
            logger.error(f"Failed to unpin hash: {str(e)}")
            return False
    
    def list_pins(self) -> Optional[Dict]:
        """Get list of all pinned hashes."""
        try:
            pins = self.client.pin.ls()
            return pins
        except Exception as e:
            logger.error(f"Failed to list pins: {str(e)}")
            return None
    
    def node_id(self) -> Optional[str]:
        """Get IPFS node ID."""
        try:
            node_info = self.client.id()
            node_id = node_info.get("ID")
            logger.info(f"IPFS Node ID: {node_id}")
            return node_id
        except Exception as e:
            logger.error(f"Failed to get node ID: {str(e)}")
            return None
    
    def close(self):
        """Close IPFS connection."""
        if self.client:
            try:
                self.client.close()
                logger.info("✓ Closed IPFS connection")
            except Exception as e:
                logger.error(f"Error closing IPFS connection: {str(e)}")
