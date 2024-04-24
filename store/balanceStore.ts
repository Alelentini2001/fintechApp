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
    timestamp: any;
    userFullName: string;
}

export interface BalanceState {
    transactions: Array<Transaction>;
    runTransaction: (transaction: Array<Transaction>, userId: string) => void;
    balance: () => number;
    clearTransactions: () => void;
}

export const useBalanceStore = create<BalanceState>()(
    persist((set, get) => ({
        transactions: [],
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
                      return transaction;
                  });

                return {
                    transactions: [...updatedTransactions]
                };
            });
        },

        balance: () => {
            return get().transactions.reduce((acc, transaction) => acc + parseFloat(transaction?.amount), 0);
        },
        
    }), {
        name: "balance",
        storage: createJSONStorage(() => zustandStorage),
    })
);
