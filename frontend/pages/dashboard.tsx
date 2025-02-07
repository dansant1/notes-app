import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken, logout } from '../services/auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  category: number; 
}

const Dashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return; 
    } else {
      fetchCategories();
      fetchNotes();
      setIsLoading(false); 
    }
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}/categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    setCategories(data);
  };

  const fetchNotes = async (categoryId?: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const url = categoryId
      ? `${API_BASE_URL}/notes/?category_id=${categoryId}`
      : `${API_BASE_URL}/notes/`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }

    const data = await response.json();
    setNotes(data);

    if (categoryId) {
      setFilteredNotes(data);
    } else {
      setFilteredNotes(data); 
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    fetchNotes(categoryId);
  };

  const handleNoteClick = (noteId: number) => {
    router.push(`/create-note?id=${noteId}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return d.toLocaleDateString('en-GB', options); 
  };

  const darkenColor = (color: string, amount: number) => {
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return `#${(1 << 24) | (r << 16) | (g << 8) | b}.toString(16).slice(1)}`;
  };

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return (
    <div style={styles.container}>
      <div style={styles.createNoteButton}>
        <button onClick={() => router.push('/create-note')} style={styles.button}>
          + New Note
        </button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.categoriesContainer}>
          <ul>
            {categories.map((category) => (
              <li key={category.id} onClick={() => handleCategoryClick(category.id)} style={{ ...styles.categoryItem, backgroundColor: category.color, borderColor: darkenColor(category.color, 30) }}>
                <span style={{ ...styles.colorCircle, backgroundColor: category.color }}></span>
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.notesContainer}>
          {filteredNotes.length === 0 ? (
            <div style={styles.noNotesMessage}>I’m just here waiting for your charming notes...</div>
          ) : (
            <ul style={styles.gridContainer}>
              {filteredNotes.map((note) => {
                const category = categories.find((category) => category.id === note.category);
                return (
                  <li key={note.id} onClick={() => handleNoteClick(note.id)} style={{ ...styles.noteItem, borderColor: category ? darkenColor(category.color, 30) : '#ccc', backgroundColor: category ? category.color : '#fff' }}>
                    <div style={styles.noteHeader}>
                      <div style={styles.noteDate}>{formatDate(note.created_at)}</div>
                      <div style={styles.categoryName}>{category?.name}</div>
                    </div>
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0px',
    height: '100vh',
  },
  createNoteButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '70px',
    width: '100%',
    padding: '10px',
    position: 'absolute',
    top: '0',
    right: '0',
  },
  noNotesMessage: {
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
  button: {
    padding: '10px',
    borderRadius: '12px', 
    border: '4px solid #F4E1B2', 
    backgroundColor: 'transparent', 
    color: '#333', 
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s, box-shadow 0.3s',
  },
  mainContent: {
    display: 'flex',
    marginTop: '100px',
    height: 'calc(100vh - 120px)',
  },
  categoriesContainer: {
    width: '20%',
    paddingRight: '20px',
    overflowY: 'auto',
  },
  notesContainer: {
    width: '80%',
    paddingLeft: '20px',
    overflowY: 'auto',
  },
  categoryItem: {
    cursor: 'pointer',
    padding: '5px',
    margin: '5px 0',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  },
  colorCircle: {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gap: '15px', 
    listStyle: 'none',
    padding: '0',
  },
  noteItem: {
    padding: '15px',
    borderRadius: '12px',
    border: '4px solid rgb(245, 245, 245)', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  noteDate: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '5px', 
  },
  categoryName: {
    fontSize: '12px',
    color: '#888',
  },
};

export default Dashboard;