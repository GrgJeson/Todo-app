import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { 
  LogOut, Plus, Search, Calendar, AlertTriangle, Check, Trash2, 
  Edit3, Filter, Clock, CheckSquare, Award, ChevronDown, CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Active, Completed
  
  // Todo Form modal/editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null); // null when creating
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  
  const navigate = useNavigate();

  // Load todos
  const fetchTodos = async () => {
    try {
      const response = await api.get('todos/');
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchTodos();
    }
  }, [user, navigate]);

  const handleOpenCreateModal = () => {
    setEditingTodo(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPriority(todo.priority);
    setDueDate(todo.due_date || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const payload = {
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
    };

    try {
      if (editingTodo) {
        await api.put(`todos/${editingTodo.id}/`, payload);
      } else {
        await api.post('todos/', payload);
      }
      setIsModalOpen(false);
      fetchTodos();
    } catch (error) {
      console.error("Form submit error:", error);
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const errorMsg = Object.entries(data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        setFormError(errorMsg);
      } else {
        setFormError("An error occurred while saving the todo.");
      }
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await api.patch(`todos/${todo.id}/`, {
        is_completed: !todo.is_completed,
      });
      fetchTodos();
    } catch (error) {
      console.error("Toggle complete error:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`todos/${id}/`);
        fetchTodos();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper: check if a task is overdue
  const isOverdue = (todo) => {
    if (todo.is_completed || !todo.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Filter and Search logic
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase()) || 
      (todo.description && todo.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesPriority = filterPriority === 'All' || todo.priority === filterPriority;
    
    let matchesStatus = true;
    if (filterStatus === 'Active') matchesStatus = !todo.is_completed;
    if (filterStatus === 'Completed') matchesStatus = todo.is_completed;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Analytics helper metrics
  const completedCount = todos.filter(t => t.is_completed).length;
  const activeCount = todos.length - completedCount;
  const overdueCount = todos.filter(isOverdue).length;
  const completionRate = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <header className="dashboard-header">
        <div className="logo-section">
          <CheckCircle size={26} className="logo-icon-main" />
          <h1>TodoPro</h1>
        </div>
        <div className="user-section">
          <div className="user-avatar">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-name">Welcome, {user?.username}</span>
          <button className="btn-logout" onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        
        {/* Stats Cards */}
        <section className="analytics-section">
          <div className="stat-card">
            <div className="stat-icon icon-tasks">
              <CheckSquare size={20} />
            </div>
            <div className="stat-info">
              <h3>{todos.length}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-active">
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <h3>{activeCount}</h3>
              <p>Active Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-completed">
              <Award size={20} />
            </div>
            <div className="stat-info">
              <h3>{completedCount}</h3>
              <p>Completed Tasks</p>
            </div>
            <div className="progress-ring-container">
              <div className="progress-label">{completionRate}%</div>
            </div>
          </div>
          {overdueCount > 0 && (
            <div className="stat-card stat-overdue">
              <div className="stat-icon icon-overdue">
                <AlertTriangle size={20} />
              </div>
              <div className="stat-info">
                <h3>{overdueCount}</h3>
                <p>Overdue Tasks</p>
              </div>
            </div>
          )}
        </section>

        {/* Filter controls */}
        <section className="controls-section">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filters-bar">
            <div className="filter-select">
              <Filter size={14} className="filter-icon" />
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="status-tabs">
              <button 
                className={filterStatus === 'All' ? 'active' : ''} 
                onClick={() => setFilterStatus('All')}
              >
                All
              </button>
              <button 
                className={filterStatus === 'Active' ? 'active' : ''} 
                onClick={() => setFilterStatus('Active')}
              >
                Active
              </button>
              <button 
                className={filterStatus === 'Completed' ? 'active' : ''} 
                onClick={() => setFilterStatus('Completed')}
              >
                Completed
              </button>
            </div>

            <button className="btn-primary btn-add" onClick={handleOpenCreateModal}>
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>
        </section>

        {/* Tasks List */}
        <section className="tasks-section">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="empty-icon" />
              <h3>All caught up!</h3>
              <p>No tasks matched your search or filters.</p>
              <button className="btn-secondary" onClick={handleOpenCreateModal}>
                Create one now
              </button>
            </div>
          ) : (
            <div className="todos-grid">
              {filteredTodos.map(todo => {
                const overdue = isOverdue(todo);
                return (
                  <div 
                    key={todo.id} 
                    className={`todo-card ${todo.is_completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
                  >
                    <div className="todo-card-main">
                      <button 
                        className={`todo-checkbox ${todo.is_completed ? 'checked' : ''}`}
                        onClick={() => handleToggleComplete(todo)}
                      >
                        {todo.is_completed && <Check size={14} />}
                      </button>

                      <div className="todo-details">
                        <h4 className="todo-title">{todo.title}</h4>
                        {todo.description && (
                          <p className="todo-description">{todo.description}</p>
                        )}
                        
                        <div className="todo-meta">
                          <span className={`priority-badge priority-${todo.priority.toLowerCase()}`}>
                            {todo.priority}
                          </span>
                          
                          {todo.due_date && (
                            <span className={`due-date-badge ${overdue ? 'date-overdue' : ''}`}>
                              <Calendar size={12} className="meta-icon" />
                              <span>{todo.due_date}</span>
                            </span>
                          )}

                          {overdue && (
                            <span className="overdue-badge">
                              <AlertTriangle size={12} className="meta-icon" />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="todo-actions">
                      <button className="action-btn edit-btn" onClick={() => handleOpenEditModal(todo)} title="Edit Task">
                        <Edit3 size={16} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteTodo(todo.id)} title="Delete Task">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Todo Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingTodo ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            {formError && (
              <div className="auth-error">
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-title">Task Title *</label>
                <input
                  type="text"
                  id="modal-title"
                  placeholder="e.g. Finish django REST API integration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-desc">Description</label>
                <textarea
                  id="modal-desc"
                  placeholder="Provide context or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="modal-priority">Priority</label>
                  <select
                    id="modal-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-duedate">Due Date</label>
                  <input
                    type="date"
                    id="modal-duedate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTodo ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
