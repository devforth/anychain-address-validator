import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { Address } from '../types.js'
import { getAddress } from '../helpers.js'

export default {
    isValidAddress: function (address: Address, caseSensitive = false) {
        const addr = getAddress(address)
        if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
            // Check if it has the basic requirements of an address
            return false;
        }

        // Otherwise check each case
        return this.verifyChecksum(addr, caseSensitive);
    },
    verifyChecksum: function (address: string, caseSensitive: boolean) {
        address = address.replace('0x', '');
        if (!/^[0-9a-fA-F]{40}$/.test(address)) {
            return false;
        }

        const normalizedAddress = address.toLowerCase();
        const addressHash = bytesToHex(keccak_256(new TextEncoder().encode(normalizedAddress)));
        for (let i = 0; i < 40; i++) {
            const expectedChar = parseInt(addressHash[i], 16) > 7
                ? normalizedAddress[i].toUpperCase()
                : normalizedAddress[i];

            if (caseSensitive ? address[i] !== expectedChar : address[i].toLowerCase() !== expectedChar.toLowerCase()) {
                return false;
            }
        }

        return true;
    }
};
