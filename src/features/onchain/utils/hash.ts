import { Hex, keccak256, stringToHex } from "viem";

function jsonWithBigInt(value: unknown) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? item.toString() : item,
  );
}

export function digestJson(value: unknown): Hex {
  return keccak256(stringToHex(jsonWithBigInt(value)));
}

export function digestText(value: string): Hex {
  return keccak256(stringToHex(value));
}
