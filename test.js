// test-session.js
import fs from 'fs';
import zlib from 'zlib';

const sessionString = 'H4sIAAAAAAAAA5VU27KiOBT9la68ajUgd6tO1aAiiDccxdtUP4QQLgoBk6Bi1/n3Kc6lz3mY6Tnzluwka6+991r5CUiZMTzFDej/BBXNrpDjdsmbCoM+GNRxjCnogghyCPrgMB2OYHjQrb20eMgNMfzLIr+sBk5nGB6HGC+nhu74MbqMrSfw3AVVHeYZ+g3gpNMcj+t4s/d269Clx4ud726uRTuboaFYtiqLjGpYpcH28ASeW0SY0YwkdpXiAlOYT3Hjw4x+jb7o7DK4G8jjxD0drp1Nb6pofDxGs4VVF72Zc1yYaHETDtRFX6N/q7CNg3RVp3fR00+adbg7iiae1uk5b4YeLy09thbxHtrGK32WJQRHkwgTnvHmy32fTppekojWpiy3+12vY4Yo0WrBuETNVkrxSdOcpTFf7Yltf434UCoEJ7fDm+nVgTT3yHIFPeUyVw/0qmM8w8Gho24vcjoqPxP36btWzv+n773R0lq2k947s0CZaBo2TfPSK92FtryuTaGnmp1RjKZ5UH6NvrDIrJGxnvn+gc/MfHsIDqUQ5/V+44iuxdBKELTlYJNPs8kHfchr+juWLGXzPw0yGtTCxWf1OewMqotaSXfbKNRwiVw3CY6F551W4Y3N+UNs5NBTt2i6jobp+Xo1b9IoJ4uYyeVdWp53J7IT0tvTS0Vn3Ewi0Jeeu4DiJGOcQp6V5CWmK10Ao+saI4r5S3sBNocRUXxVr735eKoFxX6CjIMzFHXPxgaObeRVrAjn1vz2BLqgoiXCjOHIzRgvaTPHjMEEM9D/60cXEHznr4Nr08lSF8QZZTwgdZWXMHqf6vshRKisCV83BA3bBaagL36EMecZSVjbx5pAitLsiocp5Az0Y5gz/KtCTHH0Fvv1un0VYQ6znLUinAuqwBPX9nrRw7g5jmUn1jCxwEe297G9tqVaTqpAQ6jZhIjP4g4l/lY89vD42sFJh+3KhJ0EdotnjvX0DyCgDxZrw9cmh6OdILzqDK7CnuW6SfL0tA9mtdWEyV2SjZT4+3NxSfcP+zYuTN+cz6SVl3gDaLsrlQU7iNKq6AjzLF+a21E74y6I8DVD+HMyFJBluB4ESnE2imx5P14EW19ZqDhDm950bnNy6siLHVKnQjyIHmPH3R59kyiPE9ID8SxC7SHOBqrGZClKy5E63biZ9Sqo4kXJWdS6S1UkUZZETZa1vqH8wb7f2nnAqvpOMAddQGB7G9iUYMa/cYzSb2lZMwy6IH9FUHRTlgxDkxRVV+QWpD14903+9l9lL4pqs7bbOMMv9n9D/08Wr/1pVSY+dz9hvH0o/2LKAdxk0+2SuPNzT56tZeGiPqTIiUgaCqT06fgymU0Efe429wQ8P//ogiqHPC5p0Tq6CCHoAlrWrWYnJC5/9yVa4mRoJeO27Bwybn34YJMVmHFYVK1bdalnKrJuvt7yaVm5kKWgD6SpkroKeP4bkar/LlUHAAA=';

try {
    // Try base64 decode
    const buffer = Buffer.from(sessionString, 'base64');
    
    // Try to decompress
    let jsonString;
    try {
        jsonString = zlib.gunzipSync(buffer).toString();
    } catch {
        jsonString = buffer.toString();
    }
    
    const data = JSON.parse(jsonString);
    console.log('✅ Session is valid!');
    console.log('Structure:', Object.keys(data));
    
    // Save it
    fs.writeFileSync('./session/creds.json', JSON.stringify(data, null, 2));
    console.log('✅ Saved to session/creds.json');
    
} catch (error) {
    console.error('❌ Invalid session:', error.message);
}
//lolliepopxx