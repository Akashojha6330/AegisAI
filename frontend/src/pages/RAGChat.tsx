import { useState } from 'react'
import { ragApi } from '../services/api'

interface Source {
  title: string
  content: string
}

interface RAGResponse {
  answer: string
  sources: Source[]
}

export default function RAGChat() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<RAGResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const data = await ragApi.query(question)
      setResponse(data)
    } catch (err: any) {
      if (err.response?.status === 503) {
        setError('RAG is not yet available. Please ingest documents first.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">RAG Chat</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Ask a compliance question..."
          className="flex-1 border rounded px-4 py-2 text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </div>
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {response && (
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-800 leading-relaxed">
            {response.answer}
          </div>
          {response.sources?.length > 0 && (
            <div className="mt-3 border rounded">
              <button
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center"
              >
                <span>Sources ({response.sources.length})</span>
                <span>{sourcesOpen ? '▲' : '▼'}</span>
              </button>
              {sourcesOpen && (
                <div className="border-t divide-y">
                  {response.sources.map((source, idx) => (
                    <div key={idx} className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700">{source.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{source.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
