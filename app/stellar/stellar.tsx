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
  const usdcAsset = new Asset(
    "USDC",
    "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  );

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
        asset: usdcAsset,
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

export async function authorizeTrustline(
  sourceSecretKey,
  assetIssuerPublicKey
) {
  try {
    const server = new Server("https://horizon-testnet.stellar.org");
    const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Load source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Define the asset
    const asset = new StellarSdk.Asset("USDC", assetIssuerPublicKey);

    // Build the transaction to authorize the trustline
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: asset,
        })
      )
      .addMemo(StellarSdk.Memo.text("Authorize Trustline"))
      .setTimeout(30)
      .build();

    // Sign the transaction
    transaction.sign(sourceKeypair);

    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    console.log("Trustline authorization successful:", transactionResult);
  } catch (error) {
    console.error("Error authorizing trustline:", error);
    throw new Error("Failed to authorize trustline");
  }
}

export async function swapXLMtoUSDC(publicKey, amountToSwap, secretKey) {
  console.log(publicKey, amountToSwap, secretKey);
  try {
    // Create a wallet
    console.log(publicKey, secretKey, amountToSwap);
    const wallet = Wallet.TestNet();
    const server = new Server("https://horizon-testnet.stellar.org");

    const account = await server.loadAccount(publicKey);

    const horizon = new Server("https://horizon-testnet.stellar.org");
    let fee = 100;

    try {
      fee = await horizon.fetchBaseFee();
    } catch (error) {
      console.log("=> ERROR:", error);
      throw new Error("Failed to fetch base fee");
    }

    console.log("=> Fee is", fee);
    // await getInitialFunds(publicKey);
    const sourceSecretKeyy = secretKey.replace('"', ""); // Only for signing the transaction
    const sourceSecretKey = sourceSecretKeyy.replace('"', "");
    let sourceAccount;
    let xlmBalance;
    console.log(sourceSecretKeyy);
    try {
      console.log("=> Fetching account details");
      sourceAccount = await getAccount(publicKey);
      xlmBalance =
        sourceAccount.balances[sourceAccount.balances.length - 1].balance;
    } catch (error) {
      console.log("=> ERROR:", error);
      throw new Error("Unable to fetch account details");
    }
    const trustlines = sourceAccount.balances.filter((balance) => {
      console.log(balance);
      xlmBalance = balance.asset_code !== "USDC" && balance.balance;
      return (
        balance.asset_issuer ===
          "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" &&
        balance.asset_code === "USDC"
      );
    });
    if (trustlines.length > 0) {
      console.log("Trustline already exists");
    } else {
      await authorizeTrustline(
        sourceSecretKey,
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
      );
    }

    // Create an Asset object for XLM and USDC
    const xlmAsset = Asset.native();
    const usdcAsset = new Asset(
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    );
    console.log("CIAO", (xlmBalance > 0 ? xlmBalance * 0.9 : 100).toString());
    let transaction;
    try {
      transaction = new StellarSdk.TransactionBuilder(account, {
        timebounds: await server.fetchTimebounds(100),
        networkPassphrase: StellarSdk.Networks.TESTNET,
        fee: fee.toString(),
      })
        .addOperation(
          StellarSdk.Operation.pathPaymentStrictSend({
            sendAsset: xlmAsset,
            sendAmount: amountToSwap.toString(),
            destination: publicKey,
            destAsset: usdcAsset,
            destMin: "1",
          })
        )
        .addMemo(Memo.text("Swap"))
        .build();
    } catch (error) {
      console.log("=> ERROR:", error);
      throw new Error("Failed to build transaction");
    }
    console.log("transaction");
    console.log("Keypair");
    // Sign the transaction with the account keypair
    const source = Keypair.fromSecret(sourceSecretKey);
    console.log("signing transaction");
    transaction?.sign(source);
    // Submit the transaction to the network
    if (!transaction) {
      throw new Error("Signed transaction is not valid");
    }

    // Submit the transaction to the network
    try {
      console.log("=> Submitting transaction");
      const result = await server.submitTransaction(transaction);
      console.log("=> Transaction submitted successfully:", result);

      // Retrieve updated account data
      const accountData = await getAccount(publicKey);
      console.log("Updated account data:", accountData);

      return result;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.extras) {
        const extras = error.response.data.extras;
        console.error("Error details:");
        console.error("Type:", extras.result_codes.transaction);
        console.error("Operations:", extras.result_codes.operations);
        console.error(
          "Transaction result:",
          extras.result_codes.transaction_result
        );
        console.error("Envelope XDR:", extras.envelope_xdr);
        console.error("Result XDR:", extras.result_xdr);
        console.error("Result codes:", extras.result_codes);
      }

      console.error("=> ERROR:", error);
      throw new Error("Failed to submit transaction");
    }
  } catch (error) {
    if (error.errors) {
      error.errors.forEach((err) => {
        console.error(err.code, err.message);
      });
    }
    console.error("Error swapping XLM for USDC:", error.response.data);
  }
}
