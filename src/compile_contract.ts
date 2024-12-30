import solc from "solc";
import fs from "fs";
import path from "path";
import { findImports } from "src/lib/findImports";

export async function compileContract(
  contractFileName: string,
  contractName: string
): Promise<{ abi: any; bytecode: string }> {
  // Define the contract path
  const contractPath = path.resolve(__dirname, "contracts", contractFileName);
  console.log(`Compiling contract: ${contractPath}`);
  
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found at: ${contractPath}`);
  }

  // Read the Solidity source file content
  const source = fs.readFileSync(contractPath, "utf8");

  // Define the compiler input format
  const input = {
    language: "Solidity",
    sources: {
      [contractFileName]: {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "berlin",
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  // Compile the contract with the import callback
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  // Check for compilation errors
  if (output.errors && output.errors.length > 0) {
    console.error("Compilation errors:", output.errors);
    throw new Error("Compilation failed");
  }

  // Extract ABI and bytecode
  const abi = output.contracts[contractFileName][contractName].abi;
  const bytecode = output.contracts[contractFileName][contractName].evm.bytecode.object;

  // Define the output directory for artifacts
  const artifactsDir = path.resolve(__dirname, "artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  // Write ABI and bytecode to JSON file
  const artifactPath = path.resolve(artifactsDir, `${contractName}.json`);
  fs.writeFileSync(
    artifactPath,
    JSON.stringify({ abi, bytecode }, null, 2),
    "utf8"
  );

  console.log(`Contract compiled successfully! Artifacts saved to ${artifactPath}`);
  
  return { abi, bytecode };
}

compileContract("TokenContract.sol", "TokenContract").catch((error) => {
  console.error("Contract compilation failed:", error);
  process.exit(1);
}
);