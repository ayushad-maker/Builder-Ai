import { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now() },
  },
  { _id: false },
);

const projectFile = new Schema({

})

const ProjectSchema = new Schema({
  name: { type: String, required: true, default: "Untitled Project" },
  description: { type: String, default: "" },
  files: { type: Schema.Types.Mixed, default: {} },
  messages: { type: [MessageSchema], default: [] },
  version: { type: Number, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  published: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "genrating", "revising", "completed", "failed"],
    default: "pending",
  },
  filesPlanned: { type: [], default: [] },
  currentFile: { type: String, default: null },
  error:{type:String,default:null}
});

