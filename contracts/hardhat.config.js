require('dotenv').config();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        enabled: false,
      },
    },
    polygon: {
      url: process.env.POLYGON_RPC || 'https://polygon-bor-rpc.publicnode.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 'auto',
    },
    polygonMumbai: {
      url: process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 'auto',
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
