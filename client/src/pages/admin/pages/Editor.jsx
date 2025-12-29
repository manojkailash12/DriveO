

import React, { useState, useRef, useEffect } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaSave, FaUndo, FaRedo } from 'react-icons/fa';

const Editor = () => {
  const [content, setContent] = useState('');
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef(null);

  useEffect(() => {
    // Load saved documents from localStorage
    const saved = localStorage.getItem('editorDocuments');
    if (saved) {
      setSavedDocuments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Update history when content changes
    if (content !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const saveDocument = () => {
    if (docTitle && content) {
      const newDoc = {
        id: currentDoc?.id || Date.now(),
        title: docTitle,
        content: content,
        createdAt: currentDoc?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedDocs;
      if (currentDoc) {
        updatedDocs = savedDocuments.map(doc => 
          doc.id === currentDoc.id ? newDoc : doc
        );
      } else {
        updatedDocs = [...savedDocuments, newDoc];
      }

      setSavedDocuments(updatedDocs);
      localStorage.setItem('editorDocuments', JSON.stringify(updatedDocs));
      setCurrentDoc(newDoc);
    }
  };

  const loadDocument = (doc) => {
    setCurrentDoc(doc);
    setDocTitle(doc.title);
    setContent(doc.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
  };

  const newDocument = () => {
    setCurrentDoc(null);
    setDocTitle('');
    setContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setHistory(['']);
    setHistoryIndex(0);
  };

  const deleteDocument = (id) => {
    const updatedDocs = savedDocuments.filter(doc => doc.id !== id);
    setSavedDocuments(updatedDocs);
    localStorage.setItem('editorDocuments', JSON.stringify(updatedDocs));
    
    if (currentDoc?.id === id) {
      newDocument();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousContent = history[newIndex];
      setContent(previousContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = previousContent;
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex];
      setContent(nextContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
      }
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Document Title', 'Content (Plain Text)', 'Created Date', 'Updated Date'],
      ...savedDocuments.map(doc => [
        doc.title,
        doc.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
        new Date(doc.createdAt).toLocaleDateString(),
        new Date(doc.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editor-documents-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle || 'Document'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #333; }
        </style>
      </head>
      <body>
        <h1>${docTitle || 'Untitled Document'}</h1>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rich Text Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaFilePdf />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Document Title */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Document title..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={saveDocument}
              disabled={!docTitle || !content}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FaSave />
              Save
            </button>
            <button
              onClick={newDocument}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              New
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 bg-white rounded hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <FaUndo />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-white rounded hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <FaRedo />
            </button>
            
            <div className="w-px bg-gray-400 mx-2"></div>
            
            <button
              onClick={() => handleCommand('bold')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              onClick={() => handleCommand('italic')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              onClick={() => handleCommand('underline')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Underline"
            >
              <FaUnderline />
            </button>
            
            <div className="w-px bg-gray-400 mx-2"></div>
            
            <button
              onClick={() => handleCommand('justifyLeft')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Align Left"
            >
              <FaAlignLeft />
            </button>
            <button
              onClick={() => handleCommand('justifyCenter')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Align Center"
            >
              <FaAlignCenter />
            </button>
            <button
              onClick={() => handleCommand('justifyRight')}
              className="p-2 bg-white rounded hover:bg-gray-200"
              title="Align Right"
            >
              <FaAlignRight />
            </button>
            
            <div className="w-px bg-gray-400 mx-2"></div>
            
            <select
              onChange={(e) => handleCommand('fontSize', e.target.value)}
              className="px-2 py-1 bg-white rounded border"
            >
              <option value="3">Normal</option>
              <option value="1">Small</option>
              <option value="4">Large</option>
              <option value="6">Extra Large</option>
            </select>
            
            <input
              type="color"
              onChange={(e) => handleCommand('foreColor', e.target.value)}
              className="w-8 h-8 bg-white rounded border cursor-pointer"
              title="Text Color"
            />
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="min-h-96 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            style={{ minHeight: '400px' }}
            placeholder="Start typing your document..."
          />
        </div>

        {/* Saved Documents Sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Saved Documents ({savedDocuments.length})</h3>
          
          {savedDocuments.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved documents yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {savedDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 
                      className="font-medium text-sm cursor-pointer hover:text-blue-600"
                      onClick={() => loadDocument(doc)}
                    >
                      {doc.title}
                    </h4>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                  <div 
                    className="text-xs text-gray-600 mt-1 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: doc.content.substring(0, 100) + (doc.content.length > 100 ? '...' : '') 
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;