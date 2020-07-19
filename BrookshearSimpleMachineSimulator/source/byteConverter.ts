class ByteConverter {
    static byteToInt(byte: number) {
        return (byte << 24) >> 24;
    }

    static intToByte(int: number) {
        const sign = int < 0 ? 128 : 0;
        return (int & 127) | sign;
    }

    static byteToFloat(byte: number, exponentLength = 3) {
        const mantissaLength = 7 - exponentLength;
        const exponentMask = ((2 ** exponentLength) - 1) << mantissaLength;

        if ((byte & exponentMask) === 0)
            return 0;

        const mantissaMask = (2 ** mantissaLength) - 1;
        const mantissa = byte & mantissaMask;
        const exponentBias = (2 ** (exponentLength - 1)) - 1;
        const exponent = (byte & exponentMask) >>> mantissaLength;
        const sign = (byte & 128) === 128 ? -1 : 1;
        const infinity = (2 ** exponentLength) - 1;

        if (exponent === infinity) {
            if (mantissa === 0)
                return sign * Infinity;
            
            return NaN;
        }

        const mantissaValue = 1 + (mantissa / (2 ** mantissaLength));
        return sign * mantissaValue * (2 ** (exponent - exponentBias));
    }

    static floatToByte(float: number, exponentLength = 3) {
        const bytes = new Uint8Array(new Float64Array([float]).buffer);
        const exponent64 = ((bytes[7] & 127) << 4) + ((bytes[6] & 240) >>> 4);

        if (exponent64 === 0)
            return 0;

        let sign = float < 0 ? 1 : 0;
        const infinity = (2 ** exponentLength) - 1;
        let exponent = infinity;
        const mantissaByte = ((bytes[6] & 15) << 4) + ((bytes[5] & 240) >>> 4);
        const mantissaLength = 7 - exponentLength;
        let mantissa = mantissaByte >>> (8 - mantissaLength);
        const infinity64 = 2047;

        if (exponent64 !== infinity64) {
            const exponentBias = (2 ** (exponentLength - 1)) - 1;
            const exponentBias64 = 1023;
            exponent = exponent64 - exponentBias64 + exponentBias;

            if (exponent >= infinity) {
                mantissa = 0;
                exponent = infinity;
                sign = 0;
            }
            else if (exponent < 0) {
                mantissa = 0;
                exponent = infinity;
                sign = 1;
            }
        }

        return (sign << 7) + (exponent << mantissaLength) + mantissa;
    }
}

export default ByteConverter;