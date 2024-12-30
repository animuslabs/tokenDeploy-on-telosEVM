import { ethers } from "ethers";
import { getEthersConfig } from "src/config";
import { compileContract } from "src/compile_contract";
import envData from "src/env";

// Retrieve the network argument from the command line
const network = process.argv[2] as "mainnet" | "testnet";

// Validate the network argument
if (!network || (network !== "mainnet" && network !== "testnet")) {
  console.error("Error: Please specify a valid network ('mainnet' or 'testnet').");
  console.error("Usage: node deploy_contract.js <network>");
  process.exit(1);
}

const contractName = envData.TOKEN_DEPLOY_HARDCAT_NAME;
const contractFileName = `${contractName}.sol`;
const _delegate = envData.TOKEN_CONTRACT;
const _name = envData.TOKEN_NAME;
const _symbol = envData.TOKEN_SYMBOL;

const gasLimit = BigInt(3000000);
console.log(`Gas limit: ${gasLimit}`);

async function deployContract(network: "mainnet" | "testnet") {
  // Get the ethers configuration for the specified network
  const { provider, wallet, chainId } = getEthersConfig(network);

  console.log(`Deploying contract on ${network} network (Chain ID: ${chainId})`);
  console.log(`Wallet address: ${wallet.address}`);
  
  // Log wallet balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);

  // Compile the contract
  const { abi, bytecode } = await compileContract(contractFileName, contractName);

    // Determine the LayerZero endpoint and delegate based on the network
    let _lzEndpoint: string;
    if (network === "mainnet") {
        _lzEndpoint = envData.LZ_ENDPOINT; // Mainnet
    } else if (network === "testnet") {
        _lzEndpoint = envData.TESTNET_LZ_ENDPOINT; // Testnet
    } else {
        throw new Error(`Unsupported network: ${network}`);
    }
    if (!ethers.isAddress(_lzEndpoint)) {
        throw new Error(`Invalid LayerZero endpoint address: ${_lzEndpoint}`);
      }
      if (!ethers.isAddress(_delegate)) {
        throw new Error(`Invalid delegate address: ${_delegate}`);
      }
      
  // Create a contract factory and deploy the contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet); 
  console.log("Deploying contract...");
  const contract = await factory.deploy(
    _name,
    _symbol,
    _lzEndpoint,
    _delegate,
    { gasLimit}
  );

  console.log("Waiting for deployment to be mined...");
  const receipt = await contract.deploymentTransaction()?.wait();

  console.log("Contract deployed successfully!");
  console.log("Contract Address:", contract.target);
  console.log("Transaction Hash:", receipt?.blockHash || "");

  // Verify deployment by checking the code at the contract address
  const code = await provider.getCode(contract.target);
  if (code === "0x") {
    throw new Error("Deployment failed: No contract code found at the address");
  } else {
    console.log("Deployment verified: Contract code is present");
  }
}

// Execute the deployment with the specified network
deployContract(network).catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
