// ============================================
// PLUGIN HANDLER - HOT RELOAD SYSTEM
// Install plugins WITHOUT restarting bot!
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import logging from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.join(__dirname, '../commands');
const PLUGINS_DB = path.join(__dirname, '../data/plugins_installed.json');
const API_BASE = 'https://ernest-tech-house.vercel.app/api';
const API_KEY = 'bot_live_b1OC5aMhpKBgYzwJ6xwl9_W5iwJ8qO0k';

// ============================================
// PLUGIN DATABASE
// ============================================

function loadInstalledPlugins() {
    try {
        if (fs.existsSync(PLUGINS_DB)) {
            return JSON.parse(fs.readFileSync(PLUGINS_DB, 'utf8'));
        }
    } catch (error) {
        logging.error(`[PLUGIN] Load DB error: ${error.message}`);
    }
    return [];
}

function saveInstalledPlugins(plugins) {
    try {
        const dir = path.dirname(PLUGINS_DB);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(PLUGINS_DB, JSON.stringify(plugins, null, 2));
    } catch (error) {
        logging.error(`[PLUGIN] Save DB error: ${error.message}`);
    }
}

function addToDatabase(pluginData) {
    const plugins = loadInstalledPlugins();
    
    // Remove old entry if exists
    const filtered = plugins.filter(p => p.id !== pluginData.id);
    
    filtered.push({
        ...pluginData,
        installedAt: new Date().toISOString()
    });
    
    saveInstalledPlugins(filtered);
}

// ============================================
// DOWNLOAD PLUGIN FROM API
// ============================================

export async function downloadPlugin(pluginId) {
    try {
        logging.info(`[PLUGIN] 📥 Downloading plugin: ${pluginId}`);
        
        const response = await fetch(`${API_BASE}/bot/get-plugin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ plugin: pluginId })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Download failed');
        }
        
        logging.success(`[PLUGIN] ✅ Downloaded: ${data.plugin.name} v${data.plugin.version}`);
        
        return {
            success: true,
            plugin: data.plugin,
            file: data.file
        };
        
    } catch (error) {
        logging.error(`[PLUGIN] Download failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// HOT-RELOAD: Install WITHOUT restart!
// ============================================

export async function installPlugin(pluginId, sock) {
    try {
        // Download plugin
        const download = await downloadPlugin(pluginId);
        
        if (!download.success) {
            return { success: false, error: download.error };
        }
        
        const { plugin, file } = download;
        const fileName = `${pluginId}.js`;
        const filePath = path.join(PLUGINS_DIR, fileName);
        
        // ============================================
        // STEP 1: Check if plugin already exists
        // ============================================
        
        if (fs.existsSync(filePath)) {
            logging.warn(`[PLUGIN] ⚠️ Plugin "${pluginId}" already exists. Replacing...`);
            
            // Backup old version
            const backupPath = `${filePath}.backup`;
            fs.copyFileSync(filePath, backupPath);
            logging.info(`[PLUGIN] 💾 Backed up old version`);
            
            // Unload old command from memory
            if (sock.commands && sock.commands.has(pluginId)) {
                sock.commands.delete(pluginId);
                logging.success(`[PLUGIN] 🗑️ Removed old command from memory`);
            }
        }
        
        // ============================================
        // STEP 2: Write new plugin file
        // ============================================
        
        fs.writeFileSync(filePath, file.content, 'utf8');
        logging.success(`[PLUGIN] 📝 Saved to: ${fileName}`);
        
        // ============================================
        // STEP 3: HOT-RELOAD - Load WITHOUT restart!
        // ============================================
        
        const loaded = await hotReloadCommand(filePath, sock);
        
        if (!loaded.success) {
            // Rollback on failure
            if (fs.existsSync(`${filePath}.backup`)) {
                fs.copyFileSync(`${filePath}.backup`, filePath);
                logging.warn(`[PLUGIN] 🔙 Rolled back to backup`);
            }
            return { success: false, error: loaded.error };
        }
        
        // ============================================
        // STEP 4: Update database
        // ============================================
        
        addToDatabase({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            author: plugin.author,
            category: plugin.category
        });
        
        logging.success(`[PLUGIN] 🎉 Plugin installed and loaded!`);
        logging.info(`[PLUGIN] 💡 Command available: .${pluginId}`);
        
        return {
            success: true,
            plugin,
            command: pluginId
        };
        
    } catch (error) {
        logging.error(`[PLUGIN] Install error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// HOT-RELOAD MAGIC 🔥
// Loads command into memory WITHOUT restart!
// ============================================

export async function hotReloadCommand(filePath, sock) {
    try {
        // Convert file path to file URL
        const fileUrl = pathToFileURL(filePath).href;
        
        // Clear Node.js module cache for this file
        // This is the KEY to hot-reloading!
        if (import.meta.url) {
            delete import.meta.cache?.[fileUrl];
        }
        
        // Force fresh import with cache-busting timestamp
        const timestamp = Date.now();
        const importUrl = `${fileUrl}?t=${timestamp}`;
        
        logging.info(`[PLUGIN] 🔥 Hot-reloading: ${path.basename(filePath)}`);
        
        // Import the command module
        const { default: command } = await import(importUrl);
        
        // Validate command structure
        if (!command || !command.name || typeof command.execute !== 'function') {
            throw new Error('Invalid command structure');
        }
        
        // Add to commands Map in memory
        if (!sock.commands) {
            sock.commands = new Map();
        }
        
        sock.commands.set(command.name, command);
        
        logging.success(`[PLUGIN] ✅ Hot-reloaded command: ${command.name}`);
        
        return { success: true, commandName: command.name };
        
    } catch (error) {
        logging.error(`[PLUGIN] Hot-reload failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// UNINSTALL PLUGIN
// ============================================

export function uninstallPlugin(pluginId, sock) {
    try {
        const fileName = `${pluginId}.js`;
        const filePath = path.join(PLUGINS_DIR, fileName);
        
        if (!fs.existsSync(filePath)) {
            return { success: false, error: 'Plugin not found' };
        }
        
        // Remove from memory
        if (sock.commands && sock.commands.has(pluginId)) {
            sock.commands.delete(pluginId);
            logging.success(`[PLUGIN] 🗑️ Removed from memory: ${pluginId}`);
        }
        
        // Delete file
        fs.unlinkSync(filePath);
        logging.success(`[PLUGIN] 🗑️ Deleted file: ${fileName}`);
        
        // Remove from database
        const plugins = loadInstalledPlugins();
        const filtered = plugins.filter(p => p.id !== pluginId);
        saveInstalledPlugins(filtered);
        
        logging.success(`[PLUGIN] ✅ Plugin uninstalled: ${pluginId}`);
        
        return { success: true, message: 'Plugin uninstalled' };
        
    } catch (error) {
        logging.error(`[PLUGIN] Uninstall error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ============================================
// LIST INSTALLED PLUGINS
// ============================================

export function listInstalledPlugins() {
    return loadInstalledPlugins();
}

// ============================================
// RELOAD ALL COMMANDS (on bot start)
// ============================================

export async function reloadAllCommands(sock) {
    try {
        logging.info('[PLUGIN] 🔄 Reloading all commands...');
        
        if (!fs.existsSync(PLUGINS_DIR)) {
            fs.mkdirSync(PLUGINS_DIR, { recursive: true });
        }
        
        const files = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.js'));
        
        let loaded = 0;
        let failed = 0;
        
        for (const file of files) {
            const filePath = path.join(PLUGINS_DIR, file);
            const result = await hotReloadCommand(filePath, sock);
            
            if (result.success) {
                loaded++;
            } else {
                failed++;
            }
        }
        
        logging.success(`[PLUGIN] ✅ Loaded ${loaded} commands (${failed} failed)`);
        
        return { loaded, failed };
        
    } catch (error) {
        logging.error(`[PLUGIN] Reload error: ${error.message}`);
        return { loaded: 0, failed: 0 };
    }
}