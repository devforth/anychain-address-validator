import {Address} from '../types.js'
import {getAddress} from '../helpers.js'
import {Buffer} from 'buffer'

function tonCrc16(data: Uint8Array): number {
    let crc = 0x0000;
    for (let i = 0; i < data.length; i++) {
        crc ^= (data[i] << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xffff;
            } else {
                crc = (crc << 1) & 0xffff;
            }
        }
    }
    return crc;
}

export default {
    isValidAddress: function (address: Address): boolean {
        const addr = getAddress(address);

        // Raw address
        if (/^-?[0-9]+:[0-9a-fA-F]{64}$/.test(addr)) {
            return true;
        }

        // Base64 or Base64url (48 chars length)
        if (/^[a-zA-Z0-9\-_]+$/.test(addr) || /^[a-zA-Z0-9\+/=]+$/.test(addr)) {
            if (addr.length !== 48) return false;
            try {
                let base64 = addr.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = Buffer.from(base64, 'base64');
                if (decoded.length !== 36) return false;

                const computedCrc = tonCrc16(decoded.slice(0, 34));
                const expectedCrc = (decoded[34] << 8) | decoded[35];

                return computedCrc === expectedCrc;
            } catch (e) {
                return false;
            }
        }

        return false;
    }
};
