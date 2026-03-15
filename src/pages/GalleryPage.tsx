import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, Star, FolderOpen, ImageOff } from 'lucide-react';
import { getCollection, deleteDesign, SavedDesign } from '../lib/designCollection';
import { TATTOO_STYLES } from '../constants';

function ratingColor(r: number): string {
  if (r >= 8) return '#4ade80';
  if (r >= 5) return '#c9a870';
  return '#f87171';
}

function StyleFolder({
  styleId,
  designs,
  onDelete,
}: {
  styleId: string;
  designs: SavedDesign[];
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const styleName = TATTOO_STYLES.find(s => s.id === styleId)?.name ?? styleId;
  const avgRating = designs.length
    ? (designs.reduce((a, d) => a + d.rating, 0) / designs.length).toFixed(1)
    : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid #222222' }}>
      {/* Folder header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors hover:bg-[#161616]"
      >
        <div className="flex items-center gap-3">
          <FolderOpen size={14} style={{ color: '#c9a870' }} />
          <p className="font-display text-sm font-semibold text-[#f0ece4]">{styleName}</p>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: '#1f1a13', border: '1px solid #3a2e1a', color: '#c9a870' }}
          >
            {designs.length} design{designs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {avgRating && (
            <div className="flex items-center gap-1">
              <Star size={11} style={{ color: '#c9a870' }} />
              <span className="text-xs text-[#888]">{avgRating} avg</span>
            </div>
          )}
          <span
            className="text-[#555] transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Designs grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4"
              style={{ borderTop: '1px solid #1e1e1e' }}
            >
              {designs.map(design => (
                <motion.div
                  key={design.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-xl overflow-hidden group aspect-square"
                  style={{ border: '1px solid #2a2a2a' }}
                >
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.55)' }}
                  />

                  {/* Rating badge */}
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0,0,0,0.75)',
                      border: `1px solid ${ratingColor(design.rating)}40`,
                    }}
                  >
                    <Star size={9} style={{ color: ratingColor(design.rating) }} />
                    <span className="text-[10px] font-bold" style={{ color: ratingColor(design.rating) }}>
                      {design.rating}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(design.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    style={{ background: '#c84040' }}
                    title="Delete design"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>

                  {/* Name + date on hover */}
                  <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-[#ccc] truncate font-mono leading-tight">{design.name}</p>
                    <p className="text-[9px] text-[#888] mt-0.5">
                      {new Date(design.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(getCollection);

  // Refresh from localStorage when page becomes visible
  useEffect(() => {
    setCollection(getCollection());
  }, []);

  const styleIds = Object.keys(collection);
  const totalDesigns = styleIds.reduce((a, s) => a + collection[s].length, 0);

  const handleDelete = (styleId: string, id: string) => {
    deleteDesign(styleId, id);
    setCollection(getCollection());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-4"
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-[#999] hover:text-[#e8e4de] transition-colors cursor-pointer tracking-widest uppercase"
      >
        <ChevronLeft size={13} /> Back
      </button>

      {/* Page title */}
      <div className="pb-1">
        <h2 className="font-display text-2xl font-semibold text-[#f0ece4]">Design Collection</h2>
        <p className="text-sm text-[#999] mt-1 tracking-wide">
          {totalDesigns === 0
            ? 'No saved designs yet'
            : `${totalDesigns} saved design${totalDesigns !== 1 ? 's' : ''} across ${styleIds.length} style${styleIds.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Empty state */}
      {totalDesigns === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: '#111111', border: '1px solid #1e1e1e' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <ImageOff size={20} style={{ color: '#444' }} />
          </div>
          <div>
            <p className="font-display text-sm font-medium text-[#888]">No designs saved yet</p>
            <p className="text-xs text-[#555] mt-1 leading-relaxed">
              Generate a tattoo and rate it to save it here.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-generate px-6 py-2.5 rounded-xl text-xs cursor-pointer mt-2"
          >
            Create a Design
          </button>
        </div>
      )}

      {/* Style folders */}
      {styleIds.map(styleId => (
        <StyleFolder
          key={styleId}
          styleId={styleId}
          designs={collection[styleId]}
          onDelete={(id) => handleDelete(styleId, id)}
        />
      ))}
    </motion.div>
  );
}
