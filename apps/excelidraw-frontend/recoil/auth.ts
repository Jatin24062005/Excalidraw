import { atom } from "recoil";

export const userState = atom<boolean>({
  key: "userState",  // Unique key
  default: false,    // Initial state
});
