/**
 * TVUSVET V3.0 - Serviço de Banco de Dados Local (Dexie/IndexedDB)
 * Mesma interface pública da versão RxDB - a UI não muda.
 * 100% offline: nenhuma chamada de rede.
 */
import { localDb, getLocalDb, genId } from '../core/database/localDb';

const _err = (msg, e) => console.error(`[LocalDB] ${msg}`, e);

class DatabaseService {

  // ================= PACIENTES =================
  async createPatient(p) {
    try {
      const inferredScope = p?.scope || (p?.practice === 'human' ? 'HUMAN' : 'VET');
      const np = { ...p };
      Object.keys(np).forEach((k) => {
        if (np[k] === undefined) delete np[k];
      });
      np.scope = inferredScope;
      np.id = np.id || genId();
      np.created_at = np.created_at || new Date().toISOString();
      np.updated_at = new Date().toISOString();

      if ('weight' in np) {
        const w = Number(np.weight);
        if (Number.isNaN(w)) delete np.weight;
        else np.weight = w;
      }
      if ('birth_year' in np) np.birth_year = String(np.birth_year);

      await localDb.patients.add(np);
      return np;
    } catch (e) {
      _err('Erro ao criar paciente:', e);
      throw e;
    }
  }

  /**
   * Retorna todos os pacientes OU filtrados por scope ('VET' | 'HUMAN').
   */
  async getPatients(filters = {}) {
    await getLocalDb();
    try {
      if (filters.scope) {
        return localDb.patients
          .where('scope')
          .equals(filters.scope)
          .sortBy('name');
      }
      return localDb.patients.orderBy('name').toArray();
    } catch (e) {
      _err('Erro ao listar pacientes:', e);
      return [];
    }
  }

  async getPatient(id) {
    try {
      return await localDb.patients.get(id) || null;
    } catch (e) {
      _err('Erro ao buscar paciente:', e);
      return null;
    }
  }

  async updatePatient(id, d) {
    try {
      const patch = { ...d };
      Object.keys(patch).forEach((k) => {
        if (patch[k] === undefined) delete patch[k];
      });
      patch.updated_at = new Date().toISOString();

      if ('weight' in patch) {
        const w = Number(patch.weight);
        if (Number.isNaN(w)) delete patch.weight;
        else patch.weight = w;
      }
      if ('birth_year' in patch) patch.birth_year = String(patch.birth_year);

      await localDb.patients.update(id, patch);
      return await localDb.patients.get(id);
    } catch (e) {
      _err('Erro ao atualizar paciente:', e);
      throw e;
    }
  }

  async deletePatient(id) {
    try {
      await localDb.patients.delete(id);
      // Cascade: exames do paciente
      await localDb.exams.where('patient_id').equals(id).delete();
    } catch (e) {
      _err('Erro ao excluir paciente:', e);
      throw e;
    }
  }

  // ================= TIMELINE =================
  /**
   * Timeline unificada do paciente: Exames + Receitas + Lab + Anamnese.
   * Retorna: { collection: 'exams'|'prescriptions'|'lab_exams'|'anamnesis', date, data }
   */
  async getPatientTimeline(patientId) {
    await getLocalDb();
    try {
      const [exams, prescriptions, labExams, anamnesis] = await Promise.all([
        localDb.exams.where('patient_id').equals(patientId).toArray(),
        localDb.prescriptions.where('patient_id').equals(patientId).toArray(),
        localDb.lab_exams.where('patient_id').equals(patientId).toArray(),
        localDb.anamnesis.where('patient_id').equals(patientId).toArray()
      ]);

      const entry = (collection, date, data) => ({
        collection,
        date: date || new Date().toISOString(),
        data
      });

      const merged = [
        ...exams.map((e) => entry('exams', e.date || e.exam_date || e.examDate, e)),
        ...prescriptions.map((r) => entry('prescriptions', r.date, r)),
        ...labExams.map((l) => entry('lab_exams', l.date || l.created_at, l)),
        ...anamnesis.map((a) => entry('anamnesis', a.date, a))
      ];

      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      return merged;
    } catch (e) {
      _err('Erro ao montar timeline:', e);
      return [];
    }
  }

  // ================= EXAMES =================
  async createExam(d) {
    try {
      const ne = {
        ...d,
        id: d.id || genId(),
        exam_type: d.exam_type || 'ultrasound_abd',
        date: d.date || d.exam_date || new Date().toISOString(),
        organs_data: d.organs_data || [],
        images: d.images || [],
        status: d.status || 'draft'
      };
      await localDb.exams.add(ne);
      return ne;
    } catch (e) {
      _err('Erro ao criar exame:', e);
      throw e;
    }
  }

  async getExams(pid = null) {
    await getLocalDb();
    try {
      if (pid) {
        return localDb.exams.where('patient_id').equals(pid).reverse().sortBy('date');
      }
      return localDb.exams.reverse().sortBy('date');
    } catch (e) {
      _err('Erro ao listar exames:', e);
      return [];
    }
  }

  async getExam(id) {
    try {
      return await localDb.exams.get(id) || null;
    } catch (e) {
      _err('Erro ao buscar exame:', e);
      return null;
    }
  }

  async updateExam(id, d) {
    try {
      await localDb.exams.update(id, d);
      return await localDb.exams.get(id);
    } catch (e) {
      _err('Erro ao atualizar exame:', e);
      throw e;
    }
  }

  async deleteExam(id) {
    try {
      await localDb.exams.delete(id);
    } catch (e) {
      _err('Erro ao excluir exame:', e);
      throw e;
    }
  }

  // ================= PRESCRIÇÕES =================
  async getPrescriptions(patientId = null) {
    await getLocalDb();
    try {
      if (patientId) {
        return localDb.prescriptions.where('patient_id').equals(patientId).reverse().sortBy('date');
      }
      return localDb.prescriptions.reverse().sortBy('date');
    } catch (e) {
      _err('Erro ao listar receitas:', e);
      return [];
    }
  }

  async createPrescription(d) {
    try {
      const np = {
        ...d,
        id: d.id || genId(),
        date: d.date || new Date().toISOString(),
        items: d.items || [],
        notes: d.notes || ''
      };
      await localDb.prescriptions.add(np);
      return np;
    } catch (e) {
      _err('Erro ao criar receita:', e);
      throw e;
    }
  }

  // ================= ANAMNESE (PEP) =================
  async createAnamnesis(data) {
    try {
      const nowIso = new Date().toISOString();
      const record = {
        id: data.id || genId(),
        patient_id: data.patient_id,
        date: data.date || nowIso,
        doctor_name: data.doctor_name || '',
        type: data.type,
        main_complaint: data.main_complaint || '',
        history: data.history || '',
        general_data: data.general_data || {},
        physical_exam: data.physical_exam || {},
        diagnosis: data.diagnosis || '',
        conduct: data.conduct || ''
      };
      await localDb.anamnesis.add(record);
      return record;
    } catch (e) {
      _err('Erro ao salvar anamnese:', e);
      throw e;
    }
  }

  async getAnamnesis(patientId) {
    try {
      return localDb.anamnesis.where('patient_id').equals(patientId).reverse().sortBy('date');
    } catch (e) {
      _err('Erro ao listar anamnese:', e);
      return [];
    }
  }

  // ================= IMAGENS DO EXAME =================
  async saveImage(examId, d) {
    try {
      const exam = await localDb.exams.get(examId);
      if (!exam) return null;
      const img = {
        id: genId(),
        filename: d.filename,
        data: d.data,
        originalData: d.data,
        mimeType: d.mimeType || 'image/png',
        tags: d.tags || []
      };
      await localDb.exams.update(examId, { images: [...(exam.images || []), img] });
      return img;
    } catch (e) {
      _err('Erro ao salvar imagem:', e);
      throw e;
    }
  }

  async deleteImage(examId, imageId) {
    try {
      const exam = await localDb.exams.get(examId);
      if (!exam) return;
      await localDb.exams.update(examId, {
        images: (exam.images || []).filter((i) => i.id !== imageId)
      });
    } catch (e) {
      _err('Erro ao excluir imagem:', e);
      throw e;
    }
  }

  // ================= SETTINGS & PROFILES =================
  async getSettings() {
    await getLocalDb();
    const defaults = {
      id: 'global_settings',
      practice_type: 'vet',
      active_modules: ['core', 'ultrasound', 'financial', 'prescription'],
      clinic_name: '',
      theme: 'light',
      active_profile_id: null,
      active_profile_name: null
    };
    try {
      const s = await localDb.settings.get('global_settings');
      if (!s) {
        await localDb.settings.put(defaults);
        return defaults;
      }
      return s;
    } catch (e) {
      _err('Erro ao carregar configurações:', e);
      return defaults;
    }
  }

  async updateSettings(d) {
    try {
      const current = await localDb.settings.get('global_settings') || {};
      await localDb.settings.put({ ...current, ...d, id: 'global_settings' });
      return await localDb.settings.get('global_settings');
    } catch (e) {
      _err('Erro ao salvar configurações:', e);
      throw e;
    }
  }

  async getProfiles() {
    await getLocalDb();
    try {
      return localDb.profiles.orderBy('name').toArray();
    } catch (e) {
      _err('Erro ao listar perfis:', e);
      return [];
    }
  }

  async createProfile(name, settingsData) {
    try {
      const profile = {
        id: genId(),
        name,
        clinic_name: settingsData.clinic_name || '',
        clinic_address: settingsData.clinic_address || '',
        veterinarian_name: settingsData.veterinarian_name || '',
        crmv: settingsData.crmv || '',
        professional_email: settingsData.professional_email || '',
        professional_phone: settingsData.professional_phone || '',
        letterhead_path: settingsData.letterhead_path || null,
        signature_path: settingsData.signature_path || null,
        letterhead_margins_mm: settingsData.letterhead_margins_mm || { top: 30, left: 15, right: 15, bottom: 20 }
      };
      await localDb.profiles.add(profile);
      await this.activateProfile(profile.id);
      return profile;
    } catch (e) {
      _err('Erro ao criar perfil:', e);
      throw e;
    }
  }

  async updateProfile(id, data) {
    try {
      await localDb.profiles.update(id, data);
      const settings = await this.getSettings();
      if (settings.active_profile_id === id) {
        await this.activateProfile(id);
      }
      return true;
    } catch (e) {
      _err('Erro ao atualizar perfil:', e);
      return false;
    }
  }

  async activateProfile(profileId) {
    try {
      const profileData = await localDb.profiles.get(profileId);
      if (!profileData) throw new Error('Profile not found');

      await this.updateSettings({
        active_profile_id: profileData.id,
        active_profile_name: profileData.name,
        clinic_name: profileData.clinic_name,
        clinic_address: profileData.clinic_address,
        veterinarian_name: profileData.veterinarian_name,
        crmv: profileData.crmv,
        professional_email: profileData.professional_email,
        professional_phone: profileData.professional_phone,
        letterhead_path: profileData.letterhead_path,
        signature_path: profileData.signature_path,
        letterhead_margins_mm: profileData.letterhead_margins_mm
      });
      return await localDb.settings.get('global_settings');
    } catch (e) {
      _err('Erro ao ativar perfil:', e);
      throw e;
    }
  }

  async deleteProfile(id) {
    try {
      await localDb.profiles.delete(id);
      const s = await this.getSettings();
      if (s.active_profile_id === id) {
        await this.updateSettings({ active_profile_id: null, active_profile_name: null });
      }
    } catch (e) {
      _err('Erro ao excluir perfil:', e);
      throw e;
    }
  }

  // ================= TEMPLATES =================
  async getTemplates(organ = null) {
    await getLocalDb();
    try {
      if (organ) {
        return localDb.templates.where('organ').equals(organ).toArray();
      }
      return localDb.templates.toArray();
    } catch (e) {
      _err('Erro ao listar templates:', e);
      return [];
    }
  }

  async createTemplate(d) {
    try {
      const n = { ...d, id: d.id || genId(), lang: d.lang || 'pt' };
      await localDb.templates.add(n);
      return n;
    } catch (e) {
      _err('Erro ao criar template:', e);
      throw e;
    }
  }

  async updateTemplate(id, d) {
    try {
      await localDb.templates.update(id, d);
    } catch (e) {
      _err('Erro ao atualizar template:', e);
      throw e;
    }
  }

  async deleteTemplate(id) {
    try {
      await localDb.templates.delete(id);
    } catch (e) {
      _err('Erro ao excluir template:', e);
      throw e;
    }
  }

  // ================= VALORES DE REFERÊNCIA =================
  async getReferenceValues(f = {}) {
    await getLocalDb();
    try {
      let collection = localDb.reference_values;
      if (f.organ && f.species) {
        return collection.where('[species+organ]').equals([f.species, f.organ]).toArray();
      }
      if (f.organ) {
        return collection.where('organ').equals(f.organ).toArray();
      }
      if (f.species) {
        return collection.where('species').equals(f.species).toArray();
      }
      return collection.toArray();
    } catch (e) {
      _err('Erro ao listar valores de referência:', e);
      return [];
    }
  }

  async createReferenceValue(d) {
    try {
      const n = { ...d, id: d.id || genId() };
      await localDb.reference_values.add(n);
      return n;
    } catch (e) {
      _err('Erro ao criar valor de referência:', e);
      throw e;
    }
  }

  async updateReferenceValue(id, d) {
    try {
      await localDb.reference_values.update(id, d);
    } catch (e) {
      _err('Erro ao atualizar valor de referência:', e);
      throw e;
    }
  }

  async deleteReferenceValue(id) {
    try {
      await localDb.reference_values.delete(id);
    } catch (e) {
      _err('Erro ao excluir valor de referência:', e);
      throw e;
    }
  }

  // ================= FINANCEIRO (PRO CASHFLOW) =================
  async addTransaction(data) {
    try {
      const nowIso = new Date().toISOString();
      const status = data.status || 'paid';
      const dueDateIso = data.due_date || data.dueDate || data.date || nowIso;
      const paidAtIso = data.paid_at || data.paidAt || (status === 'paid' ? (data.date || nowIso) : null);

      const transaction = {
        id: data.id || genId(),
        type: data.type,
        category: data.category || 'Geral',
        amount: parseFloat(data.amount),
        date: data.date || nowIso,
        status,
        payment_method: data.payment_method || data.paymentMethod || 'cash',
        due_date: dueDateIso,
        paid_at: paidAtIso,
        description: data.description || '',
        patient_id: data.patient_id || null
      };
      await localDb.financial.add(transaction);
      return transaction;
    } catch (e) {
      _err('Erro ao registrar transação:', e);
      throw e;
    }
  }

  async getTransactions(filters = {}) {
    await getLocalDb();
    try {
      let rows = await localDb.financial.orderBy('date').reverse().toArray();

      if (filters.type) rows = rows.filter((t) => t.type === filters.type);
      if (filters.category) rows = rows.filter((t) => t.category === filters.category);
      if (filters.patient_id) rows = rows.filter((t) => t.patient_id === filters.patient_id);
      if (filters.status) rows = rows.filter((t) => t.status === filters.status);

      if (filters.month && filters.year) {
        const start = new Date(filters.year, filters.month - 1, 1);
        const end = new Date(filters.year, filters.month, 1);
        rows = rows.filter((t) => {
          const d = new Date(t.due_date || t.date);
          return d >= start && d < end;
        });
      }
      return rows;
    } catch (e) {
      _err('Erro ao listar transações:', e);
      return [];
    }
  }

  async getBalance(filters = {}) {
    try {
      const all = await localDb.financial.toArray();

      const start = (filters.month && filters.year) ? new Date(filters.year, filters.month - 1, 1) : null;
      const end = (filters.month && filters.year) ? new Date(filters.year, filters.month, 1) : null;

      const inMonth = (t) => {
        if (!start || !end) return true;
        const d = new Date(t.due_date || t.date);
        return d >= start && d < end;
      };

      let totalIncome = 0;
      let totalExpense = 0;
      let pendingForecast = 0;

      all.filter(inMonth).forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.status === 'pending') {
          pendingForecast += amt;
          return;
        }
        if (t.status !== 'paid') return;
        if (t.type === 'income') totalIncome += amt;
        else if (t.type === 'expense') totalExpense += amt;
      });

      return { totalIncome, totalExpense, pendingForecast, balance: totalIncome - totalExpense };
    } catch (e) {
      _err('Erro ao calcular saldo:', e);
      return { totalIncome: 0, totalExpense: 0, pendingForecast: 0, balance: 0 };
    }
  }

  async updateTransaction(id, data) {
    try {
      const patch = { ...data };
      if (patch.dueDate && !patch.due_date) patch.due_date = patch.dueDate;
      if (patch.paidAt && !patch.paid_at) patch.paid_at = patch.paidAt;
      if (patch.paymentMethod && !patch.payment_method) patch.payment_method = patch.paymentMethod;
      if (patch.status === 'paid' && !patch.paid_at) patch.paid_at = new Date().toISOString();
      if (patch.status === 'pending') patch.paid_at = null;

      await localDb.financial.update(id, patch);
      return await localDb.financial.get(id);
    } catch (e) {
      _err('Erro ao atualizar transação:', e);
      throw e;
    }
  }

  async deleteTransaction(id) {
    try {
      await localDb.financial.delete(id);
    } catch (e) {
      _err('Erro ao excluir transação:', e);
      throw e;
    }
  }

  // ================= DROGAS =================
  async getDrugs(filters = {}) {
    await getLocalDb();
    try {
      if (filters.type) {
        return localDb.drugs.where('type').equals(filters.type).sortBy('name');
      }
      return localDb.drugs.orderBy('name').toArray();
    } catch (e) {
      _err('Erro ao listar medicamentos:', e);
      return [];
    }
  }

  async searchDrugs(term, type = null) {
    await getLocalDb();
    const needle = String(term || '').trim().toLowerCase();
    if (!needle) return [];
    try {
      let rows = await localDb.drugs.toArray();
      if (type) rows = rows.filter((d) => d.type === type);
      return rows
        .filter((d) => (d.name || '').toLowerCase().includes(needle))
        .slice(0, 100);
    } catch (e) {
      _err('Erro ao buscar medicamentos:', e);
      return [];
    }
  }

  async createDrug(d) {
    try {
      const n = { ...d, id: d.id || genId(), category: d.category || 'Geral' };
      await localDb.drugs.add(n);
      return n;
    } catch (e) {
      _err('Erro ao criar medicamento:', e);
      throw e;
    }
  }

  async updateDrug(id, d) {
    try {
      await localDb.drugs.update(id, d);
      return await localDb.drugs.get(id);
    } catch (e) {
      _err('Erro ao atualizar medicamento:', e);
      throw e;
    }
  }

  async deleteDrug(id) {
    try {
      await localDb.drugs.delete(id);
    } catch (e) {
      _err('Erro ao excluir medicamento:', e);
      throw e;
    }
  }

  // ================= ESTATÍSTICAS (DEV) =================
  async getStats() {
    await getLocalDb();
    try {
      const [patients, drugs, templates, profiles, financial, exams] = await Promise.all([
        localDb.patients.count(),
        localDb.drugs.count(),
        localDb.templates.count(),
        localDb.profiles.count(),
        localDb.financial.count(),
        localDb.exams.count()
      ]);
      return { patients, drugs, templates, profiles, financial, exams };
    } catch (e) {
      _err('Erro ao coletar estatísticas:', e);
      return {};
    }
  }
}

export const db = new DatabaseService();