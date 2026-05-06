// ============================================
// AUTO-UPDATE HANDLER
// Checks and installs bot updates from API
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logging from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION_FILE = path.join(__dirname, '../data/bot_version.json');
const API_BASE = 'https://ernest-tech-house.vercel.app/api';
const API_KEY = 'bot_live_b1OC5aMhpKBgYzwJ6xwl9_W5iwJ8qO0k';

// ============================================
// VERSION MANAGEMENT
// ============================================

function getCurrentVersion() {
    try {
        if (fs.existsSync(VERSION_FILE)) {
            const data = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
            return data.version;
        }
    } catch (error) {
        logging.error(`[UPDATE] Load version error: ${error.message}`);
    }
    
    // Default version
    return '1.0.0';
}

function saveVersion(version) {
    try {
        const dir = path.dirname(VERSION_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(VERSION_FILE, JSON.stringify({
            version,
            lastChecked: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        }, null, 2));
        
        logging.success(`[UPDATE] Version saved: ${version}`);
    } catch (error) {
        logging.error(`[UPDATE] Save version error: ${error.message}`);
    }
}

// ============================================
// CHECK FOR UPDATES
// ============================================

export async function checkForUpdates(silent = false) {
    try {
        const currentVersion = getCurrentVersion();
        
        if (!silent) {
            logging.info(`[UPDATE] Checking for updates... (Current: ${currentVersion})`);
        }
        
        const response = await fetch(`${API_BASE}/bot/check-update?version=${currentVersion}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.updateAvailable) {
            logging.warn(`[UPDATE] 🎉 New version available: ${data.latestVersion}`);
            logging.info(`[UPDATE] 📝 Changelog: ${data.changelog}`);
            logging.info(`[UPDATE] 🔥 Critical: ${data.critical ? 'YES' : 'NO'}`);
            logging.info(`[UPDATE] 📦 Files to update: ${data.fileCount}`);
            
            return {
                available: true,
                current: currentVersion,
                latest: data.latestVersion,
                critical: data.critical,
                changelog: data.changelog,
                fileCount: data.fileCount,
                files: data.files
            };
        } else {
            if (!silent) {
                logging.success(`[UPDATE] ✅ You're on the latest version!`);
            }
            return {
                available: false,
                current: currentVersion,
                latest: data.latestVersion
            };
        }
        
    } catch (error) {
        logging.error(`[UPDATE] Check failed: ${error.message}`);
        return { available: false, error: error.message };
    }
}

// ============================================
// DOWNLOAD AND INSTALL UPDATE
// ============================================

export async function downloadUpdate(version) {
    try {
        logging.info(`[UPDATE] 📥 Downloading version ${version}...`);
        
        const response = await fetch(`${API_BASE}/bot/download-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ version })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Download failed: ' + data.message);
        }
        
        logging.success(`[UPDATE] ✅ Downloaded ${data.fileCount} file(s)`);
        
        // Install files
        const installed = await installUpdateFiles(data.files);
        
        if (installed) {
            // Save new version
            saveVersion(version);
            
            logging.success(`[UPDATE] 🎉 Update installed successfully!`);
            logging.warn(`[UPDATE] ⚠️ Please restart bot to apply changes`);
            
            return {
                success: true,
                version,
                filesInstalled: data.fileCount,
                needsRestart: true
            };
        } else {
            throw new Error('Failed to install some files');
        }
        
    } catch (error) {
        logging.error(`[UPDATE] Download failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// INSTALL UPDATE FILES
// ============================================

async function installUpdateFiles(files) {
    try {
        let successCount = 0;
        
        for (const file of files) {
            try {
                const filePath = path.join(__dirname, '..', file.path);
                const dir = path.dirname(filePath);
                
                // Create directory if doesn't exist
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // Backup old file if exists
                if (fs.existsSync(filePath)) {
                    const backupPath = `${filePath}.backup`;
                    fs.copyFileSync(filePath, backupPath);
                    logging.info(`[UPDATE] 💾 Backed up: ${file.path}`);
                }
                
                // Write new file
                fs.writeFileSync(filePath, file.content, 'utf8');
                logging.success(`[UPDATE] ✅ Installed: ${file.path}`);
                
                successCount++;
            } catch (fileError) {
                logging.error(`[UPDATE] ❌ Failed to install ${file.path}: ${fileError.message}`);
            }
        }
        
        logging.info(`[UPDATE] Installed ${successCount}/${files.length} files`);
        return successCount === files.length;
        
    } catch (error) {
        logging.error(`[UPDATE] Install error: ${error.message}`);
        return false;
    }
}

// ============================================
// AUTO-UPDATE CHECKER (Background)
// ============================================

export function startAutoUpdateChecker(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    logging.info(`[UPDATE] 🔄 Auto-update checker started (every ${intervalHours}h)`);
    
    // Check immediately on start
    setTimeout(() => {
        checkForUpdates(true);
    }, 10000); // Check after 10 seconds
    
    // Check periodically
    setInterval(async () => {
        const updateInfo = await checkForUpdates(true);
        
        if (updateInfo.available) {
            if (updateInfo.critical) {
                logging.warn(`[UPDATE] 🚨 CRITICAL UPDATE AVAILABLE!`);
                logging.warn(`[UPDATE] 🚨 Version ${updateInfo.latest} is available`);
                logging.warn(`[UPDATE] 🚨 Run .update command to install`);
            } else {
                logging.info(`[UPDATE] ℹ️ Update ${updateInfo.latest} available (optional)`);
            }
        }
    }, intervalMs);
}

// ============================================
// ROLLBACK TO BACKUP
// ============================================

export function rollbackUpdate(filePath) {
    try {
        const fullPath = path.join(__dirname, '..', filePath);
        const backupPath = `${fullPath}.backup`;
        
        if (!fs.existsSync(backupPath)) {
            return { success: false, message: 'No backup found' };
        }
        
        fs.copyFileSync(backupPath, fullPath);
        fs.unlinkSync(backupPath);
        
        logging.success(`[UPDATE] 🔙 Rolled back: ${filePath}`);
        return { success: true, message: 'Rollback successful' };
        
    } catch (error) {
        logging.error(`[UPDATE] Rollback error: ${error.message}`);
        return { success: false, error: error.message };
    }
}