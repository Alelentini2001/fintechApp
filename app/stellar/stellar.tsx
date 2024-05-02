import {
  AccountKeypair,
  SigningKeypair,
  Wallet,
} from "@stellar/typescript-wallet-sdk";
import axios from "axios";
import { walletSdk } from "@stellar/typescript-wallet-sdk";
// import { encode as encodeBase64 } from "tweetnacl-util";
import { Account } from "@stellar/stellar-sdk"; // Import Stellar SDK transaction utilities
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
} from "@stellar/stellar-sdk";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { StellarAssetId } from "@stellar/typescript-wallet-sdk/lib/walletSdk/Asset";
import * as StellarSdk from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/lib/horizon";
//const StellarSdk = require("@stellar/stellar-sdk");

export async function getAccount(publicKey: string) {
  const horizonUrl = "https://horizon-testnet.stellar.org";

  try {
    const response = await axios.get(`${horizonUrl}/accounts/${publicKey}`);
    return response.data; // Return the account details from Horizon
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
      return error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    return null;
  }
}

export function createAccount(publicKey: string, secretKey: string) {
  const horizonUrl = "https://horizon-testnet.stellar.org";

  try {
    const response = axios.post(
      `${horizonUrl}/accounts`,
      {
        account: publicKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );
    return response.data; // Return the account details from Horizon
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAccountTransactions(publicKey: string) {
  const horizonUrl = "https://horizon-testnet.stellar.org";

  try {
    const response = await axios.get(
      `${horizonUrl}/accounts/${publicKey}/transactions`
    );
    return response.data; // Return the account details from Horizon
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getInitialFunds(publicKey: string) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();

    // const key = CryptoJS.enc.Hex.parse(SECRET_KEY!);

    // // Decrypting
    // const decrypted = CryptoJS.AES.decrypt(privateKey, key, {
    //   mode: CryptoJS.mode.ECB,
    // });
    // const privateKeyy = decrypted.toString(CryptoJS.enc.Utf8);
    return {
      ...data,
      // secretKey: privateKeyy,
    };
  } catch (e) {
    return e;
  }
}

export async function createTransactionXDR(
  sourceSeed,
  sourcePublicKey,
  destinationPublicKey,
  amountLumens,
  memoText
) {
  const server = new Server("https://horizon-testnet.stellar.org");

  const account = await server.loadAccount(sourcePublicKey);

  const horizon = new Server("https://horizon-testnet.stellar.org");
  let fee = 100;

  try {
    fee = await horizon.fetchBaseFee();
  } catch (error) {
    console.log("=> ERROR:", error);
    throw new Error("Failed to fetch base fee");
  }

  console.log("=> Fee is", fee);

  const sourceSecretKeyy = sourceSeed.replace('"', ""); // Only for signing the transaction
  const sourceSecretKey = sourceSecretKeyy.replace('"', "");
  let sourceAccount;

  try {
    console.log("=> Fetching account details");
    sourceAccount = await getAccount(sourcePublicKey);
  } catch (error) {
    console.log("=> ERROR:", error);
    throw new Error("Unable to fetch account details");
  }

  // console.log("=> Source account is", sourceAccount);

  const operation = Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: amountLumens.toString(),
    source: sourcePublicKey,
  });

  console.log("=> Building transaction");
  // console.log((amountLumens * 0.005 * 100000).toString());
  const transaction = new StellarSdk.TransactionBuilder(account, {
    timebounds: await server.fetchTimebounds(100),
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: (amountLumens * 0.005 * 100000).toString(),
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amountLumens.toString(),
        source: sourcePublicKey,
      })
    )
    .addMemo(Memo.text(memoText))
    .build();

  const transactiona = new StellarSdk.TransactionBuilder(account, {
    timebounds: await server.fetchTimebounds(100),
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: (amountLumens * 0.005 * 100000).toString(),
  })
    .addOperation(operation)
    .addMemo(Memo.text(memoText))
    .build();

  const source = Keypair.fromSecret(sourceSecretKey);

  try {
    transaction.sign(source);

    try {
      console.log("=> Submitting transaction");
      const result = await horizon.submitTransaction(transaction);
      console.log("=>", result);
      return result;
    } catch (error) {
      console.log("=> ERROR:", error);
      throw new Error("Failed to submit transaction 1");
    }
  } catch (err) {
    try {
      transactiona.sign(source);

      try {
        console.log("=> Submitting transaction");
        const result = await horizon.submitTransaction(transactiona);
        console.log("=>", result);
        return result;
      } catch (error) {
        console.log("=> ERROR:", error);
        throw new Error("Failed to submit transaction");
      }
    } catch (err) {
      console.log("=> ERROR:", error);
      throw new Error("Failed to submit transaction 2");
    }
  }
}
