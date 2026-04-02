import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, File, Trash2, Search, Tag, X } from 'lucide-react'

interface KBFile {
  id: string
  name: string
  type: string
  size: number
  tags: string[]
  content?: string
  addedAt: number
}

const AUTO_TAGS: Record<string, string> = {
  '.py': 'python', '.ts': 'typescript', '.js': 'javascript', '.tsx': 'react',
  '.json': 'config', '.csv': 'data', '.pdf': 'document', '.md': 'markdown',
  '.txt': 'text', '.png': 'image', '.jpg': 'image', '.jpeg': 'image',
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('xerox-kb', 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAllFiles(): Promise<KBFile[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly')
    const store = tx.objectStore('files')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function addFile(file: KBFile): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite')
    tx.objectStore('files').put(file)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteFile(id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite')
    tx.objectStore('files').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export default function KnowledgeTab() {
  const [files, setFiles] = useState<KBFile[]>([])
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<KBFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
    const all = await getAllFiles()
    setFiles(all.sort((a, b) => b.addedAt - a.addedAt))
  }, [])

  useEffect(() => { loadFiles() }, [loadFiles])

  const handleFiles = async (fileList: FileList) => {
    for (const f of Array.from(fileList)) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      const tags = AUTO_TAGS[ext] ? [AUTO_TAGS[ext]] : []
      let content: string | undefined

      if (f.type.startsWith('text/') || ['.json', '.md', '.csv', '.py', '.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        content = await f.text()
      }

      const kbFile: KBFile = {
        id: crypto.randomUUID(),
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        tags,
        content,
        addedAt: Date.now(),
      }
      await addFile(kbFile)
    }
    await loadFiles()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (id: string) => {
    await deleteFile(id)
    if (preview?.id === id) setPreview(null)
    await loadFiles()
  }

  const allTags = [...new Set(files.flatMap(f => f.tags))]

  const filtered = files.filter(f => {
    if (tagFilter && !f.tags.includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return f.name.toLowerCase().includes(q) || f.tags.some(t => t.includes(q)) || (f.content?.toLowerCase().includes(q) ?? false)
    }
    return true
  })

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-6 space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-[var(--color-green)] bg-[var(--color-green-dim)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-dim)]'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-dim)]" />
        <p className="text-[13px] text-[var(--color-text-muted)]">Drop files here or click to upload</p>
        <p className="text-[11px] text-[var(--color-text-dim)] mt-1">PDFs, code files, images, data files</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {/* Search + Tag filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-green)] transition-colors"
          />
        </div>
        <div className="flex gap-1 items-center">
          <Tag size={13} className="text-[var(--color-text-dim)]" />
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                tagFilter === tag ? 'bg-[var(--color-green)] text-black' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* File list */}
        <div className="flex-1 space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-[var(--color-text-dim)] text-sm">
              {files.length === 0 ? 'No files uploaded yet' : 'No matching files'}
            </div>
          ) : filtered.map(f => (
            <div
              key={f.id}
              onClick={() => f.content && setPreview(f)}
              className={`flex items-center justify-between rounded-lg border bg-[var(--color-surface)] p-3 transition-all ${
                preview?.id === f.id ? 'border-[var(--color-green)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
              } ${f.content ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-3">
                <File size={16} className="text-[var(--color-text-dim)]" />
                <div>
                  <div className="text-[13px] font-medium">{f.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--color-text-dim)]">{formatSize(f.size)}</span>
                    {f.tags.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(f.id) }}
                className="p-1.5 rounded hover:bg-[var(--color-red-dim)] text-[var(--color-text-dim)] hover:text-[var(--color-red)] transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Preview pane */}
        {preview && (
          <div className="w-[400px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold">{preview.name}</span>
              <button onClick={() => setPreview(null)} className="text-[var(--color-text-dim)] hover:text-white">
                <X size={14} />
              </button>
            </div>
            <pre className="text-[11px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)] rounded-lg p-3 overflow-auto max-h-[500px] whitespace-pre-wrap">
              {preview.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
