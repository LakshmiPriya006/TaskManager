// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI || "";

// // Establish connection only once
// if (!mongoose.connections[0].readyState) {
//   mongoose.connect(MONGODB_URI, {
//     dbName: "Task-Manager",
//   }).then(() => console.log("✅ MongoDB connected"))
//     .catch((err) => console.error("❌ MongoDB connection error:", err));
// }

// // Define User schema
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// }, { timestamps: true });

// const boardSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   lists: {
//   type: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
//   default: [],  // <--- This prevents undefined
// },

// }, { timestamps: true });

// boardSchema.virtual("lists", {
//   ref: "List",
//   localField: "_id",
//   foreignField: "boardId",
//   justOne: false,
// });

// // Enable virtuals in output
// boardSchema.set("toObject", { virtuals: true });
// boardSchema.set("toJSON", { virtuals: true });

// const ListSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
//   boardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Board" },
//   tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
// }, { timestamps: true });


// const taskSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
//   boardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Board' },
//   listId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'List' },
// }, { timestamps: true });

// // Create or reuse User model
// const User = mongoose.models.User || mongoose.model("User", userSchema);
// const Board = mongoose.models.Board || mongoose.model("Board", boardSchema);
// const List = mongoose.models.List || mongoose.model("List", ListSchema);
// const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// // Export the User model

// export { User, Board, List, Task };

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

// Establish connection only once
if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI, {
    dbName: "Task-Manager",
  }).then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

// Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Board schema - NO lists array, only virtual
const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Virtual for lists
boardSchema.virtual("lists", {
  ref: "List",
  localField: "_id",
  foreignField: "boardId",
  justOne: false,
});

boardSchema.set("toObject", { virtuals: true });
boardSchema.set("toJSON", { virtuals: true });

// List schema - NO tasks array, only virtual
const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  boardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Board" },
}, { timestamps: true });

// Virtual for tasks
ListSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "listId",
  justOne: false,
});

ListSchema.set("toObject", { virtuals: true });
ListSchema.set("toJSON", { virtuals: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  boardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Board' },
  listId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'List' },
}, { timestamps: true });

// Create or reuse models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Board = mongoose.models.Board || mongoose.model("Board", boardSchema);
const List = mongoose.models.List || mongoose.model("List", ListSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export { User, Board, List, Task };