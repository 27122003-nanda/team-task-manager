import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [assigneeId, setAssigneeId] = useState('')


  useEffect(() => {
    fetchProject()
    fetchTasks()
  }, [])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}/`)
      setProject(res.data)
    } catch {
      navigate('/projects')
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks/`)
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/projects/${id}/tasks/`, { title, description, due_date: dueDate, priority, assignee_id: assigneeId || null })
      setTitle('')

      setDescription('')
      setDueDate('')
      setPriority('MEDIUM')
      setShowTaskForm(false)
      fetchTasks()
    } catch {
      alert('Failed to create task')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status })
      fetchTasks()
    } catch {
      alert('Failed to update status')
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/projects/${id}/invite/`, { email: inviteEmail, role: inviteRole })
      alert('Member invited successfully!')
      setInviteEmail('')
      setShowInviteForm(false)
      fetchProject()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to invite member')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}/`)
      fetchTasks()
    } catch {
      alert('Failed to delete task')
    }
  }

  const todoTasks = tasks.filter(t => t.status === 'TODO')
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
  const doneTasks = tasks.filter(t => t.status === 'DONE')

  const TaskCard = ({ task }) => (
    <div className="bg-white p-3 rounded shadow mb-2">
      <p className="font-medium">{task.title}</p>
      <p className="text-xs text-gray-500 mt-1">{task.priority} priority</p>
      {task.due_date && <p className="text-xs text-gray-400">Due: {task.due_date}</p>}
      <div className="mt-2 flex gap-1 flex-wrap">
        {task.status !== 'TODO' && (
          <button onClick={() => handleStatusChange(task.id, 'TODO')}
            className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">To Do</button>
        )}
        {task.status !== 'IN_PROGRESS' && (
          <button onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
            className="text-xs bg-yellow-100 px-2 py-1 rounded hover:bg-yellow-200">In Progress</button>
        )}
        {task.status !== 'DONE' && (
          <button onClick={() => handleStatusChange(task.id, 'DONE')}
            className="text-xs bg-green-100 px-2 py-1 rounded hover:bg-green-200">Done</button>
        )}
        <button onClick={() => handleDeleteTask(task.id)}
          className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200 ml-auto">Delete</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <Link to="/projects" className="hover:underline">← Back to Projects</Link>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {project && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-gray-500">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  + Invite Member
                </button>
                <button onClick={() => setShowTaskForm(!showTaskForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + Add Task
                </button>
              </div>
            </div>

            {showInviteForm && (
              <form onSubmit={handleInvite} className="bg-white p-4 rounded-lg shadow mb-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full border rounded px-3 py-2"
                    value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select className="border rounded px-3 py-2" value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Invite
                </button>
              </form>
            )}

            {showTaskForm && (
              <form onSubmit={handleCreateTask} className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="font-semibold mb-3">New Task</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" className="w-full border rounded px-3 py-2"
                      value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select className="w-full border rounded px-3 py-2" value={priority}
                      onChange={(e) => setPriority(e.target.value)}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input type="text" className="w-full border rounded px-3 py-2"
                      value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2"
                      value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To</label>
                    <select className="w-full border rounded px-3 py-2" value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}>
                      <option value="">Unassigned</option>
                      {project && project.members.map(m => (
                        <option key={m.user.id} value={m.user.id}>{m.user.email}</option>
                      ))}
                    </select>
                  </div>

                </div>
                <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Create Task
                </button>
              </form>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-200 p-4 rounded-lg">
                <h3 className="font-bold mb-3 text-gray-700">To Do ({todoTasks.length})</h3>
                {todoTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3 text-yellow-700">In Progress ({inProgressTasks.length})</h3>
                {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3 text-green-700">Done ({doneTasks.length})</h3>
                {doneTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold mb-3">Members</h3>
                <div className="flex gap-3 flex-wrap">
                  {project.members.map(m => (
                    <div key={m.id} className="bg-gray-100 px-3 py-2 rounded">
                      <p className="text-sm font-medium">{m.user.email}</p>
                      <p className="text-xs text-gray-500">{m.role}</p>
                    </div>
                  ))}
                </div>
              </div>
          </>
        )}
      </div>
    </div>
  )
}

