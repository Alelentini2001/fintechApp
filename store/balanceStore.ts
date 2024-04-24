import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

export interface Transaction {
    id: string;
    amount: string;
    fees: string;
    merchantEmail: string;
    merchantFullName: string;
    merchantId: string;
    merchantPhone: string;
    merchantUsername: string;
    payeeEmail: string;
    payeeId: string;
    payeePhoneNumber: string;
    payeeUsername: string;
    reference: string;
    referral: string;
    timestamp: any;
    userFullName: string;
}

export interface BalanceState {
    transactions: Array<Transaction>;
    referral: number;
    runTransaction: (transaction: Array<Transaction>, userId: string) => void;
    balance: () => number;
    refer: () => number;
    computeReferralCommission: (transactions: Array<Transaction>, referralId: string) => void;
    clearTransactions: () => void;
}

export const useBalanceStore = create<BalanceState>()(
    persist((set, get) => ({
        transactions: [],
        referral: 0,
        clearTransactions: () => {
            set({ transactions: [] });
        },
        runTransaction: (newTransactions: Array<Transaction>, userId: string) => {
            set((state) => {
                set({ transactions: [] });

                const updatedTransactions = newTransactions
                  .map(transaction => {
                      // Adjust the amount if the current user is the payee
                      if (userId === transaction.payeeId && userId !== transaction.merchantId) {
                          return {
                              ...transaction,
                              amount: (-parseFloat(transaction.amount)).toString()
                          };
                      }
                      // Calculate referral commission if the referralId matches the userId
                    
                      return transaction;
                  });

                return {
                    transactions: [...updatedTransactions],
                };
            });
        },
        computeReferralCommission: (transactions: Array<Transaction>, userId: string) => {
            set({ referral: 0});
            let totalCommission = transactions.reduce((acc, transaction) => {
                    return acc + parseFloat(transaction.amount) * 0.001; // 0.1% commission
                
            }, 0);

            set(state => ({
                referral: totalCommission
            }));
        },
        balance: () => {
            return get().transactions.reduce((acc, transaction) => acc + parseFloat(transaction?.amount), 0);
        },
        refer: () => {
            return get().referral;
        },
    }), {
        name: "balance",
        storage: createJSONStorage(() => zustandStorage),
    })
);
