/**
 * IndexedDB utility for storing notes locally
 */

const DB_NAME = "OptimusNotesDB";
const DB_VERSION = 1;
const STORE_NAME = "notes";

interface Note {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  tags: string[];
  shared?: boolean;
  fileType: "text" | "pdf";
  content?: string;
  pdfBlob?: Blob;
  pdfUrl?: string;
}

class NotesDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  async addNote(note: Note): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], "readwrite");
      if (!transaction) return reject(new Error("Database not initialized"));
      const store = transaction.objectStore(STORE_NAME);

      // Don't store the pdfUrl (blob URL) as it won't work after refresh
      const noteToStore = { ...note };
      delete noteToStore.pdfUrl;

      const request = store.put(noteToStore);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getNote(id: string): Promise<Note | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], "readonly");
      if (!transaction) return reject(new Error("Database not initialized"));
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const note = request.result;
        if (note?.pdfBlob) {
          // Recreate blob URL from stored blob
          note.pdfUrl = URL.createObjectURL(note.pdfBlob);
        }
        resolve(note);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllNotes(): Promise<Note[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], "readonly");
      if (!transaction) return reject(new Error("Database not initialized"));
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result as Note[];
        // Recreate blob URLs for PDFs
        notes.forEach((note) => {
          if (note.pdfBlob) {
            note.pdfUrl = URL.createObjectURL(note.pdfBlob);
          }
        });
        resolve(notes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], "readwrite");
      if (!transaction) return reject(new Error("Database not initialized"));
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([STORE_NAME], "readwrite");
      if (!transaction) return reject(new Error("Database not initialized"));
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const notesDB = new NotesDB();
