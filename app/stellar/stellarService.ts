// import axios from 'axios';
// import path from 'path';
// import {
//   Wallet,
//   Anchor,
//   SigningKeypair,
//   Types,
//   IssuedAssetId,
//   DefaultSigner,
// } from '@stellar/typescript-wallet-sdk';
// import {
//   Memo,
//   MemoText,
//   Transaction,
//   TransactionBuilder,
// } from '@stellar/stellar-sdk';
// import * as dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// // Grabbing environment variables
// const anchorDomain = process.env.ANCHOR_DOMAIN || 'testanchor.stellar.org';
// const assetCode = process.env.ASSET_CODE || 'USDC';
// const assetIssuer = process.env.ASSET_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
// const runMainnet = process.env.RUN_MAINNET || false;
// const sourceAccountSecret = process.env.SOURCE_ACCOUNT_SECRET;
// const clientDomain = process.env.CLIENT_DOMAIN;
// const clientSecret = process.env.CLIENT_SECRET;

// // Running example
// let wallet;
// if (runMainnet === 'true') {
//   console.log('Warning: you are running this script on the public network.');
//   wallet = Wallet.MainNet();
// } else {
//   wallet = Wallet.TestNet();
// }
// const stellar = wallet.stellar();
// const anchor = wallet.anchor({
//   homeDomain: anchorDomain,
// });
// const account = stellar.account();

// let kp: SigningKeypair;
// const asset = new IssuedAssetId(assetCode, assetIssuer);

// export const createAccount = async (): Promise<SigningKeypair> => {
//   if (sourceAccountSecret) {
//     kp = SigningKeypair.fromSecret(sourceAccountSecret);
//     return kp;
//   }

//   console.log('creating account ...');
//   kp = account.createKeypair();
//   console.log(`kp: \n${kp.publicKey}\n${kp.secretKey}`);

//   // funding new account
//   await axios.get(`https://friendbot.stellar.org/?addr=${kp.publicKey}`);

//   const txBuilder = await stellar.transaction({
//     sourceAddress: kp,
//     baseFee: 1000,
//   });
//   const tx = txBuilder.addAssetSupport(asset).build();
//   kp.sign(tx);
//   await stellar.submitTransaction(tx);

//   return kp;
// };

// // Create Deposit
// let authToken: Types.AuthToken;
// export const runDeposit = async (): Promise<string> => {
//   console.log('\ncreating deposit ...');
//   const auth = await anchor.sep10();
//   authToken = await auth.authenticate({
//     accountKp: kp,
//     clientDomain,
//     walletSigner,
//   });

//   const resp = await anchor.sep24().deposit({
//     assetCode: asset.code,
//     authToken,
//     lang: 'en-US',
//     destinationMemo: new Memo(MemoText, 'test-memo'),
//     destinationAccount: kp.publicKey,
//     extraFields: { amount: '10' },
//   });

//   return resp.url;
// };

// // Watch Deposit
// export let depositDone = false;
// export const runDepositWatcher = () => {
//   console.log('\nstarting watcher ...');

//   let stop: Types.WatcherStopFunction;
//   const onMessage = (m: Types.AnchorTransaction) => {
//     console.log({ m });
//     if (m.status === Types.TransactionStatus.completed) {
//       console.log('status completed, stopping watcher');
//       stop();
//       depositDone = true;
//     }
//   };

//   const onError = (error: Types.AnchorTransaction | Error) => {
//     console.error({ error });
//   };

//   const watcher = anchor.sep24().watcher();
//   const resp = watcher.watchAllTransactions({
//     authToken,
//     assetCode: asset.code,
//     onMessage,
//     onError,
//     timeout: 5000,
//     lang: 'en-US',
//   });

//   stop = resp.stop;
// };

// // Create Withdrawal
// export const runWithdraw = async (): Promise<string> => {
//   console.log('\ncreating withdrawal ...');

//   const resp = await anchor.sep24().withdraw({
//     assetCode: asset.code,
//     authToken,
//     lang: 'en-US',
//     withdrawalAccount: kp.publicKey,
//     extraFields: { amount: '10' },
//   });

//   return resp.url;
// };

// const sendWithdrawalTransaction = async (withdrawalTxn: Types.AnchorTransaction) => {
//   const txBuilder = await stellar.transaction({
//     sourceAddress: kp,
//     baseFee: 1000,
//   });
//   const tx = txBuilder.transferWithdrawalTransaction(withdrawalTxn, asset).build();
//   kp.sign(tx);
//   await stellar.submitTransaction(tx);
// };

// // Watch Withdrawal
// export const runWithdrawWatcher = () => {
//   console.log('\nstarting watcher ...');
//   let stop: Types.WatcherStopFunction;

//   const onMessage = (m: Types.AnchorTransaction) => {
//     console.log({ m });
//     if (m.status === Types.TransactionStatus.pending_user_transfer_start) {
//       sendWithdrawalTransaction(m);
//     }
//     if (m.status === Types.TransactionStatus.completed) {
//       console.log('status completed, stopping watcher');
//       stop();
//     }
//   };

//   const onError = (e: Types.AnchorTransaction | Error) => {
//     console.error({ e });
//   };

//   const watcher = anchor.sep24().watcher();
//   const resp = watcher.watchAllTransactions({
//     authToken,
//     assetCode: asset.code,
//     onMessage,
//     onError,
//     timeout: 5000,
//     lang: 'en-US',
//   });

//   stop = resp.stop;
// };

// const walletSigner = DefaultSigner;
// walletSigner.signWithDomainAccount = async ({
//   transactionXDR,
//   networkPassphrase,
// }: Types.SignWithDomainAccountParams): Promise<Transaction> => {
//   if (!clientSecret) {
//     throw new Error('Client Secret missing from .env file');
//   }
//   const signer = SigningKeypair.fromSecret(clientSecret);
//   const transaction = TransactionBuilder.fromXDR(transactionXDR, networkPassphrase) as Transaction;
//   signer.sign(transaction);
//   return transaction;
// };
