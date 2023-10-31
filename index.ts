import dotenv from "dotenv";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { holesky } from "viem/chains";
import { abi, bytecode } from "./counterContract";

dotenv.config();

const rpc = "https://1rpc.io/holesky";

// Initialise account
const account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}`);

const walletClient = createWalletClient({
  chain: holesky,
  account,
  transport: http(rpc),
});

const publicClient = createPublicClient({
  chain: holesky,
  transport: http(rpc),
});

async function main() {
  // Deploy contract
  const hash = await walletClient.deployContract({
    abi: abi,
    bytecode: bytecode,
    args: [BigInt(10)],
  });

  console.log(`Txn hash - ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log(`Contract deployed on - ${contractAddress}`);

  // Read contract
  let counterPosition = await publicClient.readContract({
    abi: abi,
    address: contractAddress!,
    functionName: "getCounter",
  });

  console.log(`Current counter - ${counterPosition}.... Incrementing....`);

  // increment
  let counterHash = await walletClient.writeContract({
    abi: abi,
    address: contractAddress!,
    functionName: "increment",
  });

  await publicClient.waitForTransactionReceipt({ hash: counterHash });

  // read
  counterPosition = await publicClient.readContract({
    abi: abi,
    address: contractAddress!,
    functionName: "getCounter",
  });

  console.log(`Current counter - ${counterPosition}.... Decrementing....`);

  // decrement
  counterHash = await walletClient.writeContract({
    abi: abi,
    address: contractAddress!,
    functionName: "decrement",
  });

  await publicClient.waitForTransactionReceipt({ hash: counterHash });

  // read
  counterPosition = await publicClient.readContract({
    abi: abi,
    address: contractAddress!,
    functionName: "getCounter",
  });

  console.log(
    `Current counter - ${counterPosition}.... Setting counter to 15....`
  );

  // setcounter
  counterHash = await walletClient.writeContract({
    abi: abi,
    address: contractAddress!,
    functionName: "setCounter",
    args: [BigInt(15)],
  });

  await publicClient.waitForTransactionReceipt({ hash: counterHash });

  // read
  counterPosition = await publicClient.readContract({
    abi: abi,
    address: contractAddress!,
    functionName: "getCounter",
  });

  console.log(`Current counter - ${counterPosition}`);
}

main();
