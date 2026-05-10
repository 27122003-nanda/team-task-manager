import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()


  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/projects/')
      setProjects(res.data)
    } catch (err) {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }




  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/projects/', { name, description })
      setName('')
      setDescription('')
      setShowForm(false)
      fetchProjects()
    } catch (err) {
      alert('Failed to create project')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex gap-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Create Project</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </form>
        )}

        <div className="grid gap-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Loading projects...</p>
            </div>
          )}
          {!loading && projects.length === 0 && (
            <p className="text-gray-500 text-center py-8">No projects yet. Create one!</p>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-gray-500 mt-1">{project.description}</p>
              <p className="text-sm text-gray-400 mt-2">{project.members.length} member(s)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

