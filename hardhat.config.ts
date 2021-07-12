import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import './utils/wellknown';
import {node_url, accounts} from './utils/networks';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: accounts('localhost'),
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts: accounts('localhost'),
    },
    bsctestnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: accounts('testnet'),
      live: true,
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org',
      accounts: accounts('bsc'),
      live: true,
    },
    matic: {
      url: 'https://rpc-mainnet.maticvigil.com/v1/80392744a0ec25f5fd654e56407e8d6602df5d2e',
      accounts: accounts('matic'),
      live: true,
      gasPrice: 2e9,
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: accounts('mumbai'),
      live: true,
      gasPrice: 1e9,
    },
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 5,
    enabled: !!process.env.REPORT_GAS,
  },
  namedAccounts: {
    creator: 0,
    user: 1,
  },
};

export default config;
