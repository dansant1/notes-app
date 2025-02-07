import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function CreateNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<number>();
  const [noteId, setNoteId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [debouncedTitle, setDebouncedTitle] = useState('');
  const [debouncedContent, setDebouncedContent] = useState('');
  const [debouncedCategory, setDebouncedCategory] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const darkenColor = (color: string) => {
    const hex = color.replace('#', '');
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    
    r = Math.max(r - 25, 0);
    g = Math.max(g - 25, 0);
    b = Math.max(b - 25, 0);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `Last Edited: ${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes}${ampm}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/categories/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

    const { id } = router.query;
    if (id) {
      setNoteId(Number(id));
      fetchNoteDetails(Number(id));
    }
  }, [router.query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(title);
      setDebouncedContent(content);
      setDebouncedCategory(category as number);
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, category]);

  useEffect(() => {
    if (debouncedTitle || debouncedContent || debouncedCategory) {
      saveNote(debouncedTitle, debouncedContent, debouncedCategory);
    }
  }, [debouncedTitle, debouncedContent, debouncedCategory]);

  const fetchNoteDetails = async (noteId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category.id);
      if (data.created_at) {
        setCreatedAt(formatDate(data.created_at));
      }
    } catch (error) {
      console.error('Error fetching note details:', error);
    }
  };

  const saveNote = async (newTitle: string, newContent: string, newCategory: number) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      };
      const body = JSON.stringify({
        title: newTitle,
        content: newContent,
        category: newCategory || 1,
      });

      if (!noteId) {
        const response = await fetch(`${API_BASE_URL}/notes/`, {
          method: 'POST',
          headers,
          body,
        });
        const data = await response.json();
        setNoteId(data.id);
        if (data.created_at) {
          setCreatedAt(formatDate(data.created_at));
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/`, {
          method: 'PUT',
          headers,
          body,
        });
        await response.json();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === category);
  const borderColor = selectedCategory ? selectedCategory.color : '#CCCCCC';
  const darkBorderColor = selectedCategory ? darkenColor(selectedCategory.color) : '#AAAAAA';

  return (
    <div className="container mx-auto p-6">
      <select
        value={category}
        onChange={(e) => setCategory(Number(e.target.value))}
        className="w-full p-3 border rounded-lg mb-4"
      >
        <option value="">Seleccionar Categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <div
        className="w-full p-6 border-2 rounded-lg"
        style={{
          borderColor: darkBorderColor,
          backgroundColor: borderColor,
          minHeight: '70vh',
        }}
      >
        {createdAt && (
    <div 
      className="text-sm text-gray-500 absolute top-0 left-0 ml-3 mt-3"
    >
      {createdAt}
    </div>
  )}
        <div className="flex justify-between items-center mb-4">

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full p-3 text-lg"
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '2rem',
              color: darkBorderColor,
            }}
          />
        </div>
  
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenido"
          className="w-full p-3 text-lg mb-6"
          rows={6}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '1.5rem',
            color: darkBorderColor,
            padding: '1rem',
          }}
        />
      </div>
    </div>
  );
}
