import ernest from "ernest-logger";

ernest.configure({ time: true, emoji: true, level: 'info' });

const formatMsg = (msg) => {
    if (typeof msg === 'object' && msg !== null) {
        return JSON.stringify(msg, null, 2);
    }
    return msg;
};

const logging = {
    error:   (msg = "", ...args) => ernest.error(`❌ Unfortunately, there is an error: ${formatMsg(msg)}`, ...args),
    success: (msg = "", ...args) => ernest.success(`✅ Code run successfully: ${formatMsg(msg)}`, ...args),
    fatal:   (msg = "", ...args) => ernest.fatal(`[FATAL]: ${formatMsg(msg)}`, ...args),
    warn:    (msg = "", ...args) => ernest.warn(`⚠️ [WARN]: ${formatMsg(msg)}`, ...args),
    info:    (msg = "", ...args) => ernest.info(`➡️ [INFO]: ${formatMsg(msg)}`, ...args),
    debug:   () => {},
    trace:   () => {},
    child:   () => logging
};

export default logging;