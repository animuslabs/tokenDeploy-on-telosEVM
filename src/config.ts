// config for hardhat should be automatically called by the deployment script
import { ethers } from "ethers";
import envData from "src/env";

type NetworkConfig = {
  provider: ethers.JsonRpcProvider;
  wallet: ethers.Wallet;
  chainId: number;
};

export function getEthersConfig(network: "mainnet" | "testnet"): NetworkConfig {
  // Select provider URL and chain ID based on the network
  const providerUrl =
    network === "testnet" ? envData.TESTNET_EVM_ENDPOINT : envData.EVM_ENDPOINT;
  const chainId = parseInt(
    network === "testnet" ? envData.TESTNET_EVM_CHAIN_ID : envData.EVM_CHAIN_ID,
    10
  );

  if (!providerUrl || !chainId) {
    throw new Error(`Unsupported or missing configuration for network: ${network}`);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(providerUrl, chainId);
  const wallet = new ethers.Wallet(envData.EVM_PRIVATE_KEY, provider);

  console.log(`Configured ${network} network:`);
  console.log(`Provider URL: ${providerUrl}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Wallet Address: ${wallet.address}`);

  return { provider, wallet, chainId };
}
