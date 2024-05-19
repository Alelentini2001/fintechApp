import {
  AccountKeypair,
  Anchor,
  DefaultSigner,
  IssuedAssetId,
  SigningKeypair,
  Types,
  Wallet,
  WalletSigner,
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
import { Transaction } from "@stellar/stellar-base";
//const StellarSdk = require("@stellar/stellar-sdk");

interface WalletSigner {
  signWithClientAccount: ({
    transaction,
    accountKp,
  }: {
    transaction: Transaction;
    accountKp: { keypair: Keypair };
  }) => Transaction;
  signWithDomainAccount: ({
    transactionXDR,
    networkPassphrase,
    accountKp,
  }: {
    transactionXDR: string;
    networkPassphrase: string;
    accountKp: { keypair: Keypair };
  }) => Promise<Transaction>;
}

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
    startingBalance: (
      parseFloat(amountLumens) -
      parseFloat(amountLumens) * 0.005
    ).toString(),
    source: sourcePublicKey,
  });
  const operation2 = StellarSdk.Operation.payment({
    destination: "GDT36CKLBCIQUHJPAHSAYCGQW5CHLIGIRRCQ2R7B5ERRCR2DGV7ADO7Z", //Address of Fee receiver
    asset: usdcAsset,
    amount: (parseFloat(amountLumens) * 0.005).toString(),
  });

  console.log("=> Building transaction");
  console.log(parseFloat(amountLumens) - parseFloat(amountLumens) * 0.005);
  // console.log((amountLumens * 0.005 * 100000).toString());
  const transaction = new StellarSdk.TransactionBuilder(account, {
    timebounds: await server.fetchTimebounds(100),
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: (100).toString(),
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: usdcAsset,
        amount: (
          parseFloat(amountLumens) -
          parseFloat(amountLumens) * 0.005
        ).toString(),
        source: sourcePublicKey,
      })
    )
    .addOperation(
      StellarSdk.Operation.payment({
        destination: "GDT36CKLBCIQUHJPAHSAYCGQW5CHLIGIRRCQ2R7B5ERRCR2DGV7ADO7Z", //Address of Fee receiver
        asset: usdcAsset,
        amount: (parseFloat(amountLumens) * 0.005).toString(),
      })
    )
    .addMemo(Memo.text(memoText))
    .build();

  console.log(transaction);

  const transactiona = new StellarSdk.TransactionBuilder(account, {
    timebounds: await server.fetchTimebounds(100),
    networkPassphrase: StellarSdk.Networks.TESTNET,
    fee: (100).toString(),
  })
    .addOperation(operation)
    .addOperation(
      StellarSdk.Operation.payment({
        destination: "GDT36CKLBCIQUHJPAHSAYCGQW5CHLIGIRRCQ2R7B5ERRCR2DGV7ADO7Z", //Address of Fee receiver
        asset: usdcAsset,
        amount: (parseFloat(amountLumens) * 0.005).toString(),
      })
    )
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

const anchorDomain = "https://testanchor.stellar.org/";
const assetCode = process.env.ASSET_CODE || "USDC";
const assetIssuer =
  process.env.ASSET_ISSUER ||
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const runMainnet = process.env.RUN_MAINNET || false;

let wallet = Wallet.TestNet();
const stellar = wallet.stellar();
const anchor = wallet.anchor({ homeDomain: anchorDomain });
const account = stellar.account();
let kp: SigningKeypair;
const asset = new IssuedAssetId(assetCode, assetIssuer);
let authToken: Types.AuthToken;
let kpp: Keypair;

async function fetchChallengeTransaction(account: string): Promise<string> {
  const response = await axios.get(
    `https://testanchor.stellar.org/auth?account=${account}`
  );
  return response.data.transaction;
}

// Sign the challenge transaction
function signChallengeTransaction(
  transactionXDR: string,
  secretKey: string
): string {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const transaction = new StellarSdk.Transaction(
    transactionXDR,
    StellarSdk.Networks.TESTNET
  );
  transaction.sign(keypair);
  return transaction.toXDR();
}

// Submit the signed transaction
async function submitSignedTransaction(signedTransactionXDR: string) {
  const response = await axios.post("https://testanchor.stellar.org/auth", {
    transaction: signedTransactionXDR,
  });
  return response.data.token;
}

// Main function
async function authenticate(account: string, secretKey: string) {
  try {
    // Step 1: Fetch the challenge transaction
    const challengeTransactionXDR = await fetchChallengeTransaction(account);
    console.log("Challenge transaction:", challengeTransactionXDR);

    // Step 2: Sign the challenge transaction
    const signedTransactionXDR = signChallengeTransaction(
      challengeTransactionXDR,
      secretKey
    );
    console.log("Signed transaction:", signedTransactionXDR);

    // Step 3: Submit the signed transaction
    const token = await submitSignedTransaction(signedTransactionXDR);
    console.log("Authentication token:", token);

    return token;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
}
const demoWalletSigner: WalletSigner = {
  signWithClientAccount: ({ transaction, accountKp }) => {
    console.log("\nsigning ...", accountKp);
    transaction.sign(accountKp.keypair);
    console.log("\ntransaction", transaction);
    console.log("\nmemo", transaction.memo);
    console.log("\nsource", transaction.source);
    console.log("\nsource2", transaction._source);

    return transaction;
  },
  signWithDomainAccount: async ({
    transactionXDR,
    networkPassphrase,
    accountKp,
  }) => {
    console.log("\nAAAA ...", transactionXDR, networkPassphrase, accountKp);
    try {
      console.log("Received transactionXDR:", transactionXDR);
      console.log("Received networkPassphrase:", networkPassphrase);

      const response = await axios.post(
        "https://demo-wallet-server.stellar.org/sign",
        { transactionXDR, networkPassphrase }
      );
      console.log("\nResponse from demo wallet server:", response);

      if (!response.data || !response.data.transactionXDR) {
        throw new Error("Invalid response from demo wallet server");
      }
      console.log(
        "\nSigned transactionXDR from server:",
        response.data.transactionXDR
      );

      const signedTransaction = TransactionBuilder.fromXDR(
        response.data.transactionXDR,
        networkPassphrase
      ) as Transaction;
      console.log("\nParsed signed transaction:", signedTransaction);

      return signedTransaction;
    } catch (error) {
      console.error("Error during domain account signing:", error);
      throw error;
    }
  },
};
async function initiateDeposit(
  authToken: string,
  assetCode: string,
  amount: string,
  destinationAccount: string
) {
  try {
    const response = await axios.post(
      "https://testanchor.stellar.org/sep24/transactions/deposit/interactive",
      {
        asset_code: assetCode,
        amount: amount,
        account: destinationAccount,
        memo_type: "text",
        memo: "test-memo",
        lang: "en",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("Deposit initiated:", response.data);
    return response.data.url;
  } catch (error) {
    console.error(
      "Error initiating deposit:",
      error.response?.data?.error || error.message
    );
    throw error;
  }
}

async function initiateWithdrawal(
  authToken: string,
  assetCode: string,
  amount: string,
  destinationAccount: string
) {
  const withdrawalEndpoint =
    "https://testanchor.stellar.org/sep24/transactions/withdraw/interactive"; // Ensure this is correct

  try {
    const response = await axios.post(
      withdrawalEndpoint,
      {
        asset_code: assetCode,
        amount: amount,
        account: destinationAccount,
        memo_type: "text",
        memo: "test-memo",
        lang: "en",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("Withdrawal initiated:", response.data);
    return response.data.url;
  } catch (error) {
    console.error(
      "Error initiating withdrawal:",
      error.response?.data?.error || error.message
    );
    throw error;
  }
}

export const runDeposit = async (
  kp: SigningKeypair,
  clientSecret: string
): Promise<string> => {
  console.log("\ncreating deposit ...");
  const sourceSecretKeyy = clientSecret.replace('"', ""); // Only for signing the transaction
  const sourceSecretKey = sourceSecretKeyy.replace('"', "");
  console.log("\nsourceSecretKey ...", sourceSecretKey);

  const keyp = Keypair.fromSecret(sourceSecretKey);
  console.log("\nkeypair ...", keyp);

  const accountKp = new AccountKeypair(keyp);
  const sep10 = await anchor.sep10();
  console.log("\nanchor ...");

  let authToken;
  try {
    authToken = await authenticate(keyp.publicKey(), keyp.secret());
  } catch (err) {
    console.log("\nerror ...", err);
    throw err; // Re-throw the error to handle it in the calling context
  }

  console.log("\nstep3 ...");

  try {
    console.log("\nasdas", asset.code, keyp.publicKey());
    const depositUrl = await initiateDeposit(
      authToken,
      asset.code,
      "10",
      keyp.publicKey()
    );
    console.log("Open url:\n", depositUrl);
    return depositUrl;
  } catch (err) {
    console.log("Error initiating deposit:", err);
    throw err;
  }
};

export const runDepositWatcher = () => {
  let stop: Types.WatcherStopFunction;
  const onMessage = (m: Types.AnchorTransaction) => {
    if (m.status === Types.TransactionStatus.completed) {
      stop();
    }
  };

  const onError = (error: Types.AnchorTransaction | Error) => {
    console.error({ error });
  };
  console.log("\nCiaooo");
  const watcher = anchor.sep24().watcher();
  const resp = watcher.watchAllTransactions({
    authToken,
    assetCode: asset.code,
    onMessage,
    onError,
    timeout: 5000,
    lang: "en-US",
  });
  console.log("\nResp: ", resp);

  stop = resp.stop;
};

export const runWithdrawal = async (
  kp: SigningKeypair,
  clientSecret: string
): Promise<string> => {
  console.log("\ncreating withdrawal ...");
  const sourceSecretKey = clientSecret.replace(/"/g, ""); // Only for signing the transaction
  console.log("\nsourceSecretKey ...", sourceSecretKey);

  const keypair = Keypair.fromSecret(sourceSecretKey);
  console.log("\nkeypair ...", keypair);

  const accountKp = new AccountKeypair(keypair);
  console.log("\nanchor ...");

  let authToken;
  try {
    authToken = await authenticate(keypair.publicKey(), keypair.secret());
  } catch (err) {
    console.log("\nerror ...", err);
    throw err; // Re-throw the error to handle it in the calling context
  }

  console.log("\nstep3 ...");

  try {
    const withdrawalUrl = await initiateWithdrawal(
      authToken,
      assetCode,
      "10",
      kp.publicKey
    );
    console.log("Open url:\n", withdrawalUrl);

    // Start watching for the withdrawal transaction
    return withdrawalUrl;
  } catch (err) {
    console.log("Error initiating withdrawal:", err);
    throw err;
  }
};

export const runWithdrawWatcher = () => {
  let stop: Types.WatcherStopFunction;

  const onMessage = (m: Types.AnchorTransaction) => {
    if (m.status === Types.TransactionStatus.pending_user_transfer_start) {
      sendWithdrawalTransaction(m);
    }
    if (m.status === Types.TransactionStatus.completed) {
      stop();
    }
  };

  const onError = (e: Types.AnchorTransaction | Error) => {
    console.error({ e });
  };

  const watcher = anchor.sep24().watcher();
  const resp = watcher.watchAllTransactions({
    authToken,
    assetCode: asset.code,
    onMessage,
    onError,
    timeout: 5000,
    lang: "en-US",
  });

  stop = resp.stop;
};

const sendWithdrawalTransaction = async (
  withdrawalTxn: Types.AnchorTransaction
) => {
  const txBuilder = await stellar.transaction({
    sourceAddress: kp,
    baseFee: 1000,
  });
  const tx = txBuilder
    .transferWithdrawalTransaction(withdrawalTxn, asset)
    .build();
  kp.sign(tx);
  await stellar.submitTransaction(tx);
};

const getWalletSigner = (clientSecret: string) => {
  const walletSigner = DefaultSigner;
  console.log("\nsecret ...", clientSecret);
  walletSigner.signWithDomainAccount = async ({
    transactionXDR,
    networkPassphrase,
  }: Types.SignWithDomainAccountParams): Promise<StellarSdk.Transaction> => {
    const signer = SigningKeypair.fromSecret(clientSecret);
    const transaction = TransactionBuilder.fromXDR(
      transactionXDR,
      networkPassphrase
    ) as StellarSdk.Transaction;
    signer.sign(transaction);
    return transaction;
  };
  return walletSigner;
};
