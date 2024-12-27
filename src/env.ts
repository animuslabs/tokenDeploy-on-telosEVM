import dotenv from "dotenv"
dotenv.config({ path: "../.env" })
import { z } from "zod"

const env = z
  .object({
    EVM_PRIVATE_KEY: z.string(),
    TOKEN_CONTRACT: z.string(),
    TOKEN_DEPLOY_HARDCAT_NAME: z.string(),
    TOKEN_NAME: z.string(),
    TOKEN_SYMBOL: z.string(),
    TESTNET_LZ_ENDPOINT: z.string(),    
    LZ_ENDPOINT: z.string(),
    TOKEN_CONTRACT_OWNER: z.string(),
    EVM_ENDPOINT: z.string(),
    EVM_CHAIN_ID: z.string(),
    TESTNET_EVM_ENDPOINT: z.string(),
    TESTNET_EVM_CHAIN_ID: z.string(),
  })
  .safeParse(process.env)
if (!env.success) throw new Error("Missing environment variables: " + JSON.stringify(env.error.formErrors, null, 2))
const envData = env.data
export default envData
