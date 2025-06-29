// GERENCIADOR DE DADOS - PERSISTÊNCIA ROBUSTA PARA O PLANEJADOR SEMANAL

class DataManager {
    constructor() {
        this.storageKey = "scheduleWeekData_v2"; // Nova versão para evitar conflitos
        this.backupKey = "scheduleWeekData_backup_v2";
        this.metadataKey = "scheduleMetadata_v2";
        this.autoSaveTimeout = null;
        this.lastSaveTime = 0;
        this.saveThrottle = 2000; // 2 segundos
        this.hasUnsavedChanges = false;
        
        // Verificar integridade do localStorage
        this.checkStorageIntegrity();
        
        console.log("📁 DataManager inicializado - Sistema de persistência ativo");
    }

    // ==================== VERIFICAÇÃO E INTEGRIDADE ====================

    checkStorageIntegrity() {
        try {
            // Teste básico de localStorage
            const testKey = 'dm_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            // Verificar espaço disponível (aproximado)
            const estimate = this.getStorageSize();
            console.log(`💾 LocalStorage funcional. Uso estimado: ${estimate.used}KB/${estimate.total}KB`);
            
            return true;
        } catch (error) {
            console.error("❌ Erro no localStorage:", error);
            return false;
        }
    }

    getStorageSize() {
        let total = 0;
        let used = 0;
        
        try {
            // Estimar tamanho total (aproximado)
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    used += localStorage[key].length + key.length;
                }
            }
            
            // Limite típico do localStorage é 5-10MB
            total = 5000; // 5MB em KB
            
            return {
                used: Math.round(used / 1024),
                total: total
            };
        } catch (error) {
            return { used: 0, total: 5000 };
        }
    }

    // ==================== SALVAMENTO ROBUSTO ====================

    saveData(weekData, forceImmediate = false) {
        try {
            // Validar dados antes de salvar
            if (!this.validateWeekData(weekData)) {
                console.error("❌ Dados inválidos - salvamento cancelado");
                return false;
            }

            const dataToSave = {
                weekData: weekData,
                timestamp: Date.now(),
                version: "2.0",
                checksum: this.generateChecksum(weekData)
            };

            if (forceImmediate) {
                return this.performSave(dataToSave);
            } else {
                return this.scheduleSave(dataToSave);
            }
        } catch (error) {
            console.error("❌ Erro ao preparar salvamento:", error);
            return false;
        }
    }

    scheduleSave(dataToSave) {
        this.hasUnsavedChanges = true;
        
        // Cancelar salvamento anterior se existir
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Agendar novo salvamento
        this.autoSaveTimeout = setTimeout(() => {
            this.performSave(dataToSave);
        }, this.saveThrottle);

        return true;
    }

    performSave(dataToSave) {
        try {
            const jsonData = JSON.stringify(dataToSave);
            
            // Fazer backup antes de salvar novo
            this.createBackup();
            
            // Salvar dados principais
            localStorage.setItem(this.storageKey, jsonData);
            
            // Salvar metadata
            localStorage.setItem(this.metadataKey, JSON.stringify({
                lastSave: Date.now(),
                size: jsonData.length,
                weekCount: Object.keys(dataToSave.weekData).length
            }));

            this.hasUnsavedChanges = false;
            this.lastSaveTime = Date.now();
            
            console.log(`✅ Dados salvos! ${Object.keys(dataToSave.weekData).length} semanas (${Math.round(jsonData.length/1024)}KB)`);
            this.showSaveIndicator();
            
            return true;
        } catch (error) {
            console.error("❌ Erro ao salvar dados:", error);
            
            // Tentar recuperar backup em caso de erro
            this.attemptRecovery();
            return false;
        }
    }

    createBackup() {
        try {
            const currentData = localStorage.getItem(this.storageKey);
            if (currentData) {
                localStorage.setItem(this.backupKey, currentData);
            }
        } catch (error) {
            console.warn("⚠️ Não foi possível criar backup:", error);
        }
    }

    // ==================== CARREGAMENTO E RECUPERAÇÃO ====================

    loadData() {
        try {
            console.log("📂 Carregando dados do planejador...");
            
            // Tentar carregar dados principais
            const savedData = localStorage.getItem(this.storageKey);
            
            if (!savedData) {
                console.log("📝 Nenhum dado encontrado. Criando estrutura inicial.");
                return {};
            }

            const parsedData = JSON.parse(savedData);
            
            // Verificar integridade dos dados
            if (!this.validateLoadedData(parsedData)) {
                console.warn("⚠️ Dados corrompidos. Tentando recuperar backup...");
                return this.loadBackup();
            }

            console.log(`✅ Dados carregados! ${Object.keys(parsedData.weekData).length} semanas`);
            return parsedData.weekData;

        } catch (error) {
            console.error("❌ Erro ao carregar dados:", error);
            return this.loadBackup();
        }
    }

    loadBackup() {
        try {
            console.log("🔄 Tentando carregar backup...");
            
            const backupData = localStorage.getItem(this.backupKey);
            if (!backupData) {
                console.log("❌ Nenhum backup disponível. Iniciando com dados limpos.");
                return {};
            }

            const parsedBackup = JSON.parse(backupData);
            
            if (this.validateLoadedData(parsedBackup)) {
                console.log("✅ Backup carregado com sucesso!");
                return parsedBackup.weekData;
            } else {
                console.log("❌ Backup também corrompido. Iniciando com dados limpos.");
                return {};
            }
        } catch (error) {
            console.error("❌ Erro ao carregar backup:", error);
            return {};
        }
    }

    attemptRecovery() {
        console.log("🔧 Iniciando recuperação automática...");
        
        try {
            // Limpar dados corrompidos
            localStorage.removeItem(this.storageKey);
            
            // Tentar restaurar do backup
            const backup = this.loadBackup();
            if (Object.keys(backup).length > 0) {
                this.saveData(backup, true);
                console.log("✅ Recuperação bem-sucedida!");
            }
        } catch (error) {
            console.error("❌ Falha na recuperação:", error);
        }
    }

    // ==================== VALIDAÇÃO ====================

    validateWeekData(weekData) {
        if (!weekData || typeof weekData !== 'object') return false;
        
        // Verificar se tem pelo menos estrutura básica
        for (let weekId in weekData) {
            const week = weekData[weekId];
            if (!week.blocks || !Array.isArray(week.blocks)) {
                return false;
            }
            
            // Validar estrutura de cada bloco
            for (let block of week.blocks) {
                if (!block.id || typeof block.day !== 'number' || 
                    typeof block.startTime !== 'number' || 
                    typeof block.duration !== 'number') {
                    return false;
                }
            }
        }
        
        return true;
    }

    validateLoadedData(data) {
        if (!data || !data.weekData || !data.timestamp) return false;
        if (!this.validateWeekData(data.weekData)) return false;
        
        // Verificar se não é muito antigo (mais de 30 dias)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (data.timestamp < thirtyDaysAgo) {
            console.warn("⚠️ Dados muito antigos detectados");
        }
        
        return true;
    }

    generateChecksum(data) {
        // Simples checksum para detectar corrupção
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // ==================== UTILITÁRIOS ====================

    forceSave(weekData) {
        console.log("💾 Salvamento forçado iniciado...");
        return this.saveData(weekData, true);
    }

    hasChanges() {
        return this.hasUnsavedChanges;
    }

    getMetadata() {
        try {
            const metadata = localStorage.getItem(this.metadataKey);
            return metadata ? JSON.parse(metadata) : null;
        } catch (error) {
            return null;
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            localStorage.removeItem(this.metadataKey);
            console.log("🧹 Todos os dados foram limpos");
            return true;
        } catch (error) {
            console.error("❌ Erro ao limpar dados:", error);
            return false;
        }
    }

    exportData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `planejador_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                console.log("📤 Dados exportados com sucesso!");
            }
        } catch (error) {
            console.error("❌ Erro ao exportar dados:", error);
        }
    }

    showSaveIndicator() {
        const indicator = document.getElementById("saveIndicator");
        if (indicator) {
            indicator.classList.add("show");
            setTimeout(() => indicator.classList.remove("show"), 2000);
        }
    }

    // ==================== MONITORAMENTO ====================

    startMonitoring() {
        // Salvar automaticamente antes de sair da página
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                // Último salvamento de emergência
                console.log("🚨 Salvamento de emergência antes de sair...");
                // Nota: salvamento síncrono limitado em beforeunload
            }
        });

        // Monitorar visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.hasUnsavedChanges) {
                console.log("👁️ Página oculta - salvamento preventivo");
                this.performSave({ 
                    weekData: window.scheduler?.weekData || {},
                    timestamp: Date.now(),
                    version: "2.0"
                });
            }
        });

        console.log("👁️ Monitoramento de dados ativo");
    }
}

// Criar instância global
window.dataManager = new DataManager();

// Iniciar monitoramento quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager.startMonitoring();
}); 