
import React, { useState, useEffect } from 'react';
import { SketchPicker, ChromePicker, CompactPicker } from 'react-color';
import { FaDownload, FaFilePdf, FaFileExcel, FaPalette, FaSave } from 'react-icons/fa';

const ColorPicker = () => {
  const [selectedColor, setSelectedColor] = useState('#3174ad');
  const [colorHistory, setColorHistory] = useState([]);
  const [pickerType, setPickerType] = useState('sketch');
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [currentPalette, setCurrentPalette] = useState([]);
  const [paletteName, setPaletteName] = useState('');

  useEffect(() => {
    // Load saved palettes from localStorage
    const saved = localStorage.getItem('colorPalettes');
    if (saved) {
      setSavedPalettes(JSON.parse(saved));
    }
  }, []);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    
    // Add to history if not already present
    if (!colorHistory.includes(color.hex)) {
      const newHistory = [color.hex, ...colorHistory.slice(0, 19)]; // Keep last 20 colors
      setColorHistory(newHistory);
    }
  };

  const addToCurrentPalette = () => {
    if (!currentPalette.includes(selectedColor)) {
      setCurrentPalette([...currentPalette, selectedColor]);
    }
  };

  const savePalette = () => {
    if (paletteName && currentPalette.length > 0) {
      const newPalette = {
        id: Date.now(),
        name: paletteName,
        colors: [...currentPalette],
        createdAt: new Date().toISOString()
      };
      
      const updatedPalettes = [...savedPalettes, newPalette];
      setSavedPalettes(updatedPalettes);
      localStorage.setItem('colorPalettes', JSON.stringify(updatedPalettes));
      
      setPaletteName('');
      setCurrentPalette([]);
    }
  };

  const deletePalette = (id) => {
    const updatedPalettes = savedPalettes.filter(palette => palette.id !== id);
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('colorPalettes', JSON.stringify(updatedPalettes));
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Palette Name', 'Color', 'Hex Code', 'RGB', 'Created Date'],
      ...savedPalettes.flatMap(palette => 
        palette.colors.map(color => {
          const rgb = hexToRgb(color);
          return [
            palette.name,
            color,
            color,
            `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            new Date(palette.createdAt).toLocaleDateString()
          ];
        })
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palettes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const textContent = `Color Palettes Report\n\n${savedPalettes.map(palette => 
      `${palette.name}:\n${palette.colors.map(color => `  ${color}`).join('\n')}\n`
    ).join('\n')}`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palettes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const renderColorPicker = () => {
    const commonProps = {
      color: selectedColor,
      onChange: handleColorChange
    };

    switch (pickerType) {
      case 'chrome':
        return <ChromePicker {...commonProps} />;
      case 'compact':
        return <CompactPicker {...commonProps} />;
      default:
        return <SketchPicker {...commonProps} />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPalette className="text-blue-600" />
          Color Picker & Palette Manager
        </h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Picker Section */}
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPickerType('sketch')}
              className={`px-3 py-1 rounded ${pickerType === 'sketch' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Sketch
            </button>
            <button
              onClick={() => setPickerType('chrome')}
              className={`px-3 py-1 rounded ${pickerType === 'chrome' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Chrome
            </button>
            <button
              onClick={() => setPickerType('compact')}
              className={`px-3 py-1 rounded ${pickerType === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Compact
            </button>
          </div>

          {renderColorPicker()}

          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Selected Color</h3>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <div>
                <p><strong>Hex:</strong> {selectedColor}</p>
                <p><strong>RGB:</strong> {hexToRgb(selectedColor) ? 
                  `rgb(${hexToRgb(selectedColor).r}, ${hexToRgb(selectedColor).g}, ${hexToRgb(selectedColor).b})` : 'Invalid'}</p>
              </div>
              <button
                onClick={addToCurrentPalette}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add to Palette
              </button>
            </div>
          </div>

          {/* Color History */}
          {colorHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recent Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorHistory.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Palette Management Section */}
        <div className="space-y-4">
          {/* Current Palette */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Current Palette</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPalette.map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Palette name"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={savePalette}
                disabled={!paletteName || currentPalette.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                <FaSave />
                Save
              </button>
            </div>
          </div>

          {/* Saved Palettes */}
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Saved Palettes ({savedPalettes.length})</h3>
            {savedPalettes.length === 0 ? (
              <p className="text-gray-500">No saved palettes yet</p>
            ) : (
              <div className="space-y-3">
                {savedPalettes.map((palette) => (
                  <div key={palette.id} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{palette.name}</h4>
                      <button
                        onClick={() => deletePalette(palette.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                          onClick={() => setSelectedColor(color)}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(palette.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;