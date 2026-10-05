'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ExternalLink, Edit2, Trash2, Save, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { TEMPLATE_LIST } from '@/lib/templates';
import { clientCreateProject } from '@/lib/api/project-client';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InlineError, TableSkeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_id: string;
  project_title: string;
  project_slug: string;
  design_name: string;
  invitation_link: string;
  status: 'aktual' | 'proses' | 'selesai';
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'aktual', label: 'Aktual', color: 'bg-accent text-accent-foreground' },
  { value: 'proses', label: 'Proses', color: 'bg-amber-100 text-amber-800' },
  { value: 'selesai', label: 'Selesai', color: 'bg-emerald-100 text-emerald-800' }
];

const EMPTY_CLIENT = { name: '', email: '', phone: '', project_id: '', design_name: '', template_id: '' };

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState(EMPTY_CLIENT);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  async function loadClients() {
    setLoading(true);
    setLoadError(false);
    try {
      if (demoIsDemoMode()) {
        // Demo mode: load from localStorage
        const stored = localStorage.getItem('di_clients');
        if (stored) setClients(JSON.parse(stored));
      } else {
        // Production: fetch from projects with client info
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projects) {
          const clientList: Client[] = projects.map((p) => ({
            id: p.id,
            name: p.title.split(' - ')[0] || p.title,
            email: '',
            phone: '',
            project_id: p.id,
            project_title: p.title,
            project_slug: p.slug,
            design_name: p.title,
            invitation_link: `/${p.slug}`,
            status: 'aktual' as const,
            created_at: p.created_at
          }));
          setClients(clientList);
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function saveClients(updatedClients: Client[]) {
    setClients(updatedClients);
    if (demoIsDemoMode()) {
      localStorage.setItem('di_clients', JSON.stringify(updatedClients));
    }
  }

  async function handleAddClient() {
    if (!newClient.name.trim()) return;
    setCreating(true);

    try {
      let projectId = newClient.project_id;
      let projectTitle = '';
      let projectSlug = '';

      // Auto-create project from template if selected
      if (newClient.template_id) {
        const title = newClient.design_name || `${newClient.name} - Undangan`;
        const res = await clientCreateProject(title, newClient.template_id);
        if (res?.id) {
          projectId = res.id;
          projectTitle = title;
          projectSlug = res.id; // slug is generated server-side
        }
      }

      const client: Client = {
        id: `client-${Date.now()}`,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        project_id: projectId,
        project_title: projectTitle,
        project_slug: projectSlug,
        design_name: newClient.design_name || TEMPLATE_LIST.find(t => t.id === newClient.template_id)?.name || '',
        invitation_link: projectSlug ? `/${projectSlug}` : '',
        status: 'proses',
        created_at: new Date().toISOString()
      };

      saveClients([client, ...clients]);
      setShowAddModal(false);
      setNewClient(EMPTY_CLIENT);
    } finally {
      setCreating(false);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    saveClients(clients.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleUpdateStatus(id: string, status: Client['status']) {
    saveClients(clients.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  const filteredClients = clients.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.project_title.toLowerCase().includes(query) ||
      c.design_name.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Manajemen Client</h2>
          <p className="text-sm text-muted-foreground">{clients.length} client terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input py-2 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : loadError ? (
        <InlineError
          title="Gagal memuat data client"
          description="Terjadi kendala saat mengambil data client. Periksa koneksi lalu coba lagi."
          onRetry={loadClients}
        />
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
            <Users className="h-6 w-6 text-gold-strong" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">Belum ada data client</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">Tambah client untuk mulai melacak undangan dan status pengerjaan.</p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4">
            <Plus className="h-4 w-4" aria-hidden /> Tambah Client
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Daftar client</caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nama Client</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Desain</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Link Undangan</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                      {client.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{client.design_name || '-'}</td>
                  <td className="px-4 py-3">
                    {client.invitation_link ? (
                      <div className="flex flex-col gap-1">
                        <a
                          href={client.invitation_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gold-deep hover:underline"
                        >
                          Lihat Undangan <ExternalLink className="h-3 w-3" />
                        </a>
                        {client.project_id && (
                          <a
                            href={`/builder/${client.project_id}`}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold-deep"
                          >
                            Edit Desain
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={client.status}
                      onChange={(e) => handleUpdateStatus(client.id, e.target.value as Client['status'])}
                      aria-label={`Status client ${client.name}`}
                      className="h-11 rounded-md border border-input bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {client.invitation_link && (
                        <a
                          href={`/builder/${client.project_id}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Buka builder untuk ${client.name}`}
                          title="Buka editor"
                        >
                          <Edit2 className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteTarget(client)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Hapus client ${client.name}`}
                        title="Hapus client"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={(o) => { if (!o) setShowAddModal(false); }}>
        <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6 sm:rounded-2xl">
          <DialogTitle className="text-lg font-semibold">Tambah Client Baru</DialogTitle>
          <DialogDescription className="sr-only">
            Isi data client baru, opsional membuat project undangan otomatis dari template.
          </DialogDescription>
          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="cl-name" className="mb-1 block text-sm font-medium text-foreground">Nama Client *</label>
              <input
                id="cl-name"
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                placeholder="Nama client"
              />
            </div>
            <div>
              <label htmlFor="cl-email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
              <input
                id="cl-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                placeholder="email@client.com"
              />
            </div>
            <div>
              <label htmlFor="cl-phone" className="mb-1 block text-sm font-medium text-foreground">No. WhatsApp</label>
              <input
                id="cl-phone"
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label htmlFor="cl-design" className="mb-1 block text-sm font-medium text-foreground">Nama Desain</label>
              <input
                id="cl-design"
                type="text"
                value={newClient.design_name}
                onChange={(e) => setNewClient({ ...newClient, design_name: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
                placeholder="Contoh: Wedding Theme Gold"
              />
            </div>
            <div>
              <label htmlFor="cl-template" className="mb-1 block text-sm font-medium text-foreground">Pilih Template</label>
              <select
                id="cl-template"
                value={newClient.template_id}
                onChange={(e) => setNewClient({ ...newClient, template_id: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value="">-- Pilih Template (otomatis buat project) --</option>
                {TEMPLATE_LIST.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">Jika dipilih, project undangan akan otomatis dibuat.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name.trim() || creating}
                className="rounded-lg bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {creating ? 'Membuat...' : <><Save className="mr-1 inline h-4 w-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus client ini?"
        message={
          deleteTarget ? `Data client "${deleteTarget.name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.` : ''
        }
        confirmLabel="Hapus"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}