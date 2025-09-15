import { concat, isHexString, toBeHex } from 'ethers';
import { generateArrayKey } from '../generateArrayKey';

/**
 * Generates a data key of `{ "keyType": "Array" }` at a specific `index`. `arrayKey` can have the following values:
 * 1. An array data key, 32 bytes hex value.
 * 2. An array data key name of type `dataKeyName[]` that will be used to generate an array data key using `generateArrayKey(arrayKey)`.
 *
 * @since v0.0.1
 * @category LSP2
 *
 * @param arrayKey The Array data key from which to generate the Array data key at a specific `index`.
 * @param index The index number in the `arrayKey`.
 *
 * @return The generated `bytes32` data key of key type Array at a specific `index`.
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 * @example
 * ```ts
 * generateArrayElementKeyAtIndex(arrayDataKeyName, index) => `<bytes16(keccak256(arrayDataKeyName))>:<bytes16(index)>`
 * generateArrayElementKeyAtIndex(arrayDataKey, index) => `<bytes16(arrayDataKey)>:<bytes16(index)>`
 * ```
 */
export const generateArrayElementKeyAtIndex = (arrayKey: string, index: number) => {
    let arrayKeyHex = arrayKey;

    if (!isHexString(arrayKey, 32)) {
        arrayKeyHex = generateArrayKey(arrayKey);
    }

    const elementInArray = concat([arrayKeyHex.substring(0, 34), toBeHex(index, 16)]);

    return elementInArray;
};
