// store.ts (or a new file like store/reconciler.ts)
import { createTransform } from "redux-persist";

// Define the keys you want to blacklist from being persisted within each slice
const blacklistedFields: string[] = ["loading", "status", "error", "message"];

// Create the transform
const stateReconciler = createTransform(
  // (1) Transform state on its way to being serialized and persisted.
  (inboundState: any) => {
    if (!inboundState) {
      return inboundState;
    }
    // Create a new object to avoid mutating the original state
    const newState = { ...inboundState };

    // Remove the blacklisted fields
    blacklistedFields.forEach(field => {
      delete newState[field];
    });

    return newState;
  },

  // (2) Transform state being rehydrated
  (outboundState: any) => {
    if (!outboundState) {
      return outboundState;
    }
    // Restore the blacklisted fields with their initial/default values
    const restoredState = {
      ...outboundState,
      loading: false,
      status: "idle",
      error: null,
      message: "",
    };
    return restoredState;
  },

  // (3) Define which reducers this transform should be applied to
  {
    whitelist: ["auth"],
  }
);

export default stateReconciler;
