import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import {
  Code,
  Github,
  ExternalLink,
  Plus,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { language, t, projects, submitProject, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [techInput, setTechInput] = useState('React, TypeScript, Azure');
  const [teamMembersInput, setTeamMembersInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const allTechnologies = [
    'all',
    'Azure',
    'TypeScript',
    'Python',
    'React 19',
    'OpenAI',
    'Docker',
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titleAr.includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTech =
      selectedTech === 'all' ||
      p.technologies.some((t) => t.toLowerCase().includes(selectedTech.toLowerCase()));

    return matchesSearch && matchesTech;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    submitProject({
      title,
      titleAr: titleAr || title,
      description,
      descriptionAr: descriptionAr || description,
      coverImage: '/src/assets/images/msc_track_dev_cyber_1794505303748.jpg',
      technologies: techInput.split(',').map((t) => t.trim()).filter(Boolean),
      teamMembers: teamMembersInput.split(',').map((m) => m.trim()).filter(Boolean),
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      featured: false,
    });

    setSubmitModalOpen(false);
    setTitle('');
    setTitleAr('');
    setDescription('');
    setDescriptionAr('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            {language === 'ar' ? 'معرض ابتكارات الطلاب' : 'Student Engineering Showcase'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? 'مشاريع وبرمجيات طلاب جامعة الابتكار' : 'Student Projects & Systems'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            {language === 'ar'
              ? 'تطبيقات وأنظمة حقيقية بنتها فرق عمل النادي باستخدام خدمات مايكروسوفت السحابية والذكاء الاصطناعي.'
              : 'Production applications and cloud systems built by student developers using Azure, AI, and modern web architectures.'}
          </p>
        </div>

        <button
          onClick={() => setSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة مشروع جديد (+300 XP)' : 'Submit Project (+300 XP)'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tech Tags Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {allTechnologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedTech === tech
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {project.featured && (
                <div className="absolute top-3 start-3 bg-[#123F6E] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  FEATURED
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {language === 'ar' ? project.titleAr : project.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {language === 'ar' ? project.descriptionAr : project.description}
                </p>

                {project.teamMembers.length > 0 && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {project.teamMembers.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Links Strip */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Code</span>
                  </a>
                ) : (
                  <span />
                )}

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:underline font-bold"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SUBMIT PROJECT MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#123F6E] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200">
                  Student Submission
                </span>
                <h3 className="text-base font-bold">
                  {language === 'ar' ? 'تسليم مشروع طلابي جديد' : 'Submit Student Project'}
                </h3>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title (EN)</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Campus Smart Locker"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان بالعربية</label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: الخزائن الذكية بالحرم الجامعي"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe problem solved, architecture, and results..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Team Members</label>
                  <input
                    type="text"
                    value={teamMembersInput}
                    onChange={(e) => setTeamMembersInput(e.target.value)}
                    placeholder="e.g. Ahmad, Sarah"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'نشر المشروع الآن (+300 XP)' : 'Publish Project (+300 XP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
