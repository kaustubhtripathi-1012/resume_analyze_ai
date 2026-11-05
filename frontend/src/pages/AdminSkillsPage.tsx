import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { adminApi, SkillItem } from '../api/admin';

export const AdminSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState('');
  const [category, setCategory] = useState<'language' | 'framework' | 'tool' | 'soft'>('tool');
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = () => {
    setLoading(true);
    adminApi.getSkills({ q: search, category: categoryFilter, limit: 100 })
      .then((data) => setSkills(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkills();
  }, [categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const aliasArray = aliases.split(',').map((a) => a.trim()).filter(Boolean);
      await adminApi.createSkill({ name: name.trim(), aliases: aliasArray, category });
      setModalOpen(false);
      setName('');
      setAliases('');
      fetchSkills();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill from the taxonomy?')) return;
    try {
      await adminApi.deleteSkill(id);
      setSkills(skills.filter((s) => s._id !== id));
    } catch (err: any) {
      alert('Failed to delete skill.');
    }
  };

  const columns = [
    {
      header: 'Canonical Name',
      accessor: 'name' as keyof SkillItem,
      className: 'font-semibold text-slate-900'
    },
    {
      header: 'Category',
      render: (s: SkillItem) => (
        <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {s.category}
        </span>
      )
    },
    {
      header: 'Aliases / Synonyms',
      render: (s: SkillItem) => (
        <span className="text-xs text-muted">
          {s.aliases?.length ? s.aliases.join(', ') : 'None'}
        </span>
      )
    },
    {
      header: 'Action',
      render: (s: SkillItem) => (
        <button
          onClick={() => handleDelete(s._id)}
          className="text-danger hover:text-red-700 p-1"
          title="Delete Skill"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills Taxonomy Editor</h1>
          <p className="text-sm text-muted mt-0.5">Maintain the master catalog of recognized technical skills and aliases.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Skill
        </Button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills by name or alias..."
          className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-slate-300 bg-white"
        >
          <option value="">All Categories</option>
          <option value="language">Programming Language</option>
          <option value="framework">Framework / Library</option>
          <option value="tool">Developer Tool / Cloud / DB</option>
          <option value="soft">Soft Skill</option>
        </select>
        <Button onClick={fetchSkills} variant="secondary" className="h-9 px-4">
          Filter
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading skills taxonomy..." />
      ) : (
        <Card>
          <Table
            columns={columns}
            data={skills}
            keyExtractor={(s) => s._id}
          />
        </Card>
      )}

      {/* Modal for adding new skill */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Skill to Taxonomy"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Canonical Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PyTorch"
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Aliases (comma separated)</label>
            <input
              type="text"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="e.g. torch, pytorch-lightning"
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="language">Programming Language</option>
              <option value="framework">Framework / Library</option>
              <option value="tool">Developer Tool / Cloud / DB</option>
              <option value="soft">Soft Skill</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Skill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

