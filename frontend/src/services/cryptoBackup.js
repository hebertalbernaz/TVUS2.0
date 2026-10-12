// Backup físico completo do banco local (Dexie) em .zip, com criptografia AES-GCM opcional.
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { localDb } from '../core/database/localDb';

const BACKUP_FORMAT = 'tvusvet-backup';
const BACKUP_VERSION = 1;
const ENC_MAGIC = strToU8('TVUSENC1');
const MEDIA_TABLE = 'media';

async function deriveKey(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey('raw', strToU8(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptBytes(bytes, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  const out = new Uint8Array(ENC_MAGIC.length + salt.length + iv.length + cipher.length);
  out.set(ENC_MAGIC, 0);
  out.set(salt, ENC_MAGIC.length);
  out.set(iv, ENC_MAGIC.length + 16);
  out.set(cipher, ENC_MAGIC.length + 28);
  return out;
}

async function decryptBytes(bytes, passphrase) {
  const offset = ENC_MAGIC.length;
  const salt = bytes.slice(offset, offset + 16);
  const iv = bytes.slice(offset + 16, offset + 28);
  const key = await deriveKey(passphrase, salt);
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, bytes.slice(offset + 28)));
  } catch {
    throw new Error('Senha incorreta ou arquivo corrompido.');
  }
}

export function isEncryptedBackup(bytes) {
  return bytes.length > ENC_MAGIC.length && ENC_MAGIC.every((b, i) => bytes[i] === b);
}

export async function createBackup(passphrase) {
  const files = {};
  const counts = {};

  for (const table of localDb.tables) {
    const rows = await table.toArray();
    counts[table.name] = rows.length;
    if (table.name === MEDIA_TABLE) {
      const meta = [];
      for (const { blob, ...rest } of rows) {
        meta.push(rest);
        files[`media/${rest.id}`] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
      }
      files[`db/${MEDIA_TABLE}.json`] = strToU8(JSON.stringify(meta));
    } else {
      files[`db/${table.name}.json`] = strToU8(JSON.stringify(rows));
    }
  }

  const createdAt = new Date().toISOString();
  files['manifest.json'] = strToU8(JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    db_version: localDb.verno,
    created_at: createdAt,
    tables: counts
  }, null, 2));

  const zipped = zipSync(files, { level: 6 });
  const bytes = passphrase ? await encryptBytes(zipped, passphrase) : zipped;
  const stamp = createdAt.slice(0, 19).replace(/[:T]/g, '-');
  return {
    blob: new Blob([bytes], { type: passphrase ? 'application/octet-stream' : 'application/zip' }),
    filename: `tvusvet-backup-${stamp}.${passphrase ? 'tvusbak' : 'zip'}`,
    counts
  };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readBackupFile(file, passphrase) {
  let bytes = new Uint8Array(await file.arrayBuffer());
  if (isEncryptedBackup(bytes)) {
    if (!passphrase) throw new Error('Este backup é protegido por senha.');
    bytes = await decryptBytes(bytes, passphrase);
  }

  let entries;
  try {
    entries = unzipSync(bytes);
  } catch {
    throw new Error('Arquivo de backup inválido.');
  }

  const manifest = entries['manifest.json'] && JSON.parse(strFromU8(entries['manifest.json']));
  if (!manifest || manifest.format !== BACKUP_FORMAT) throw new Error('Este arquivo não é um backup do TVUSvet.');
  if (manifest.version > BACKUP_VERSION) throw new Error('Backup criado por uma versão mais nova do aplicativo.');

  const data = {};
  for (const table of localDb.tables) {
    const entry = entries[`db/${table.name}.json`];
    const rows = entry ? JSON.parse(strFromU8(entry)) : [];
    if (!Array.isArray(rows)) throw new Error(`Dados inválidos na tabela ${table.name}.`);
    data[table.name] = table.name === MEDIA_TABLE
      ? rows
          .filter((m) => entries[`media/${m.id}`])
          .map((m) => ({ ...m, blob: new Blob([entries[`media/${m.id}`]], { type: m.mimeType }) }))
      : rows;
  }
  return { manifest, data };
}

export async function restoreBackup({ data }) {
  await localDb.transaction('rw', localDb.tables, async () => {
    for (const table of localDb.tables) {
      await table.clear();
      if (data[table.name]?.length) await table.bulkPut(data[table.name]);
    }
  });
}
