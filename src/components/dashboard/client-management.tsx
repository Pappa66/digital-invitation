'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ExternalLink, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { TEMPLATE_LIST } from '@/lib/templates';
import { clientCreateProject } from '@/lib/api/project-client';
import { useRouter } from 'next/navigation';

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
  { value: 'aktual', label: 'Aktual', color: 'bg-blue-100 text-blue-700' },
  { value: 'proses', label: 'Proses', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-700' }
];

export default function ClientManagement() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', project_id: '', design_name: '', template_id: '' });
  const [creating, setCreating] = useState(false);

  async function loadClients() {
    setLoading(true);
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
      setNewClient({ name: '', email: '', phone: '', project_id: '', design_name: '', template_id: '' });
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteClient(id: string) {
    if (confirm('Hapus client ini?')) {
      saveClients(clients.filter((c) => c.id !== id));
    }
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
          <p className="text-sm text-gray-500">{clients.length} client terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#c9a45c] focus:outline-none focus:ring-1 focus:ring-[#c9a45c]"
          />
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Memuat data client...</div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-gray-500">Belum ada data client</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Desain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Link Undangan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      {client.email && <p className="text-xs text-gray-500">{client.email}</p>}
                      {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{client.design_name || '-'}</td>
                  <td className="px-4 py-3">
                    {client.invitation_link ? (
                      <div className="flex flex-col gap-1">
                        <a
                          href={client.invitation_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[#c9a45c] hover:underline"
                        >
                          Lihat Undangan <ExternalLink className="h-3 w-3" />
                        </a>
                        {client.project_id && (
                          <a
                            href={`/builder/${client.project_id}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#c9a45c]"
                          >
                            Edit Design
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={client.status}
                      onChange={(e) => handleUpdateStatus(client.id, e.target.value as Client['status'])}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-[#c9a45c] focus:outline-none"
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
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tambah Client Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Client *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="Nama client"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="email@client.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">No. WhatsApp</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Desain</label>
                <input
                  type="text"
                  value={newClient.design_name}
                  onChange={(e) => setNewClient({ ...newClient, design_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                  placeholder="Contoh: Wedding Theme Gold"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Pilih Template</label>
                <select
                  value={newClient.template_id}
                  onChange={(e) => setNewClient({ ...newClient, template_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#c9a45c] focus:outline-none"
                >
                  <option value="">-- Pilih Template (otomatis buat project) --</option>
                  {TEMPLATE_LIST.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-gray-500">Jika dipilih, project undangan akan otomatis dibuat.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={!newClient.name.trim() || creating}
                  className="rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {creating ? 'Membuat...' : <><Save className="mr-1 inline h-4 w-4" /> Simpan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
