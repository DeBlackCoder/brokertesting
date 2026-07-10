import mongoose, { Document, Model, Schema } from "mongoose";

export type WalletTxType = "deposit" | "withdrawal" | "credit" | "debit" | "demo_topup" | "bonus";
export type WalletTxStatus = "pending" | "confirmed" | "rejected";

export interface IWalletTransaction {
  _id?: mongoose.Types.ObjectId;
  type:       WalletTxType;
  amount:     number;
  status:     WalletTxStatus;
  note?:      string;
  createdBy?: mongoose.Types.ObjectId; // admin who credited/debited
  txHash?:    string;                  // on-chain tx hash for deposits
  createdAt:  Date;
}

export interface IWallet extends Document {
  userId:         mongoose.Types.ObjectId;
  liveBalance:    number;  // actual funded balance — trades debit this
  demoBalance:    number;  // paper-trading balance — user can top up freely
  depositAddress: string;  // crypto/bank address set by admin
  transactions:   IWalletTransaction[];
  createdAt:      Date;
  updatedAt:      Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type:      { type: String, enum: ["deposit","withdrawal","credit","debit","demo_topup","bonus"], required: true },
    amount:    { type: Number, required: true },
    status:    { type: String, enum: ["pending","confirmed","rejected"], default: "confirmed" },
    note:      { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    txHash:    { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const WalletSchema = new Schema<IWallet>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    liveBalance:    { type: Number, default: 0, min: 0 },
    demoBalance:    { type: Number, default: 10000 }, // start with $10k demo by default
    depositAddress: { type: String, default: "" },
    transactions:   { type: [WalletTransactionSchema], default: [] },
  },
  { timestamps: true }
);

if (mongoose.models.Wallet) delete mongoose.models.Wallet;
const Wallet: Model<IWallet> = mongoose.model<IWallet>("Wallet", WalletSchema);
export default Wallet;
