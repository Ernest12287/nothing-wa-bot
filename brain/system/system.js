// ============================================
// BRAIN/SYSTEM — ENGINE
// ============================================

import os from 'os';

const startTime = Date.now();

export function getPing() {
    const start = Date.now();
    return Date.now() - start;
}

export function getUptime() {
    const ms      = Date.now() - startTime;
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours   = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days    = Math.floor(ms / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds };
}

export function getSystemInfo() {
    const totalMem = os.totalmem();
    const freeMem  = os.freemem();
    const usedMem  = totalMem - freeMem;

    return {
        platform: os.platform(),
        arch:     os.arch(),
        hostname: os.hostname(),
        cpus:     os.cpus().length,
        totalMem: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usedMem:  (usedMem  / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        freeMem:  (freeMem  / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        nodeVersion: process.version,
        pid: process.pid
    };
}

export function isAlive() {
    return { alive: true, timestamp: new Date().toISOString() };
}