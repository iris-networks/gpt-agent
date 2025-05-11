const { useState, useEffect } = React;

/**
 * Caption Editor component for editing frame captions and action details
 * @param {Object} props - Component props
 * @param {Object} props.caption - Caption object containing conversation data
 * @param {Function} props.onSave - Function to call when saving changes
 * @param {Function} props.onCancel - Function to call when canceling edits
 */
function CaptionEditor({ caption, onSave, onCancel }) {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingActions, setEditingActions] = useState(false);
  const [editingRawJson, setEditingRawJson] = useState(false);
  
  // For editing raw JSON
  const [rawJsonString, setRawJsonString] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  // For editing action inputs
  const [actionInputs, setActionInputs] = useState([]);
  
  // Initialize with caption data when caption changes
  useEffect(() => {
    if (caption && caption.conversation) {
      // Set thought text
      if (caption.conversation.value) {
        setText(caption.conversation.value);
      } else {
        setText('');
      }
      
      // Initialize action inputs if predictionParsed exists
      if (caption.conversation.predictionParsed && caption.conversation.predictionParsed.length > 0) {
        const parsedActions = caption.conversation.predictionParsed.map(action => {
          return {
            action_type: action.action_type || '',
            action_inputs: { ...action.action_inputs } || {},
            thought: action.thought || '',
            original: action // Keep a reference to the original object
          };
        });
        
        setActionInputs(parsedActions);
        
        // Set raw JSON
        setRawJsonString(JSON.stringify(caption.conversation.predictionParsed, null, 2));
      } else {
        setActionInputs([]);
        setRawJsonString('[]');
      }
    } else {
      setText('');
      setActionInputs([]);
      setRawJsonString('[]');
    }
    
    setIsEditing(false);
    setEditingActions(false);
    setEditingRawJson(false);
    setJsonError('');
  }, [caption]);

  // Start editing text
  const handleEditText = () => {
    setIsEditing(true);
    setEditingActions(false);
    setEditingRawJson(false);
  };
  
  // Start editing actions
  const handleEditActions = () => {
    setEditingActions(true);
    setIsEditing(false);
    setEditingRawJson(false);
  };
  
  // Start editing raw JSON
  const handleEditRawJson = () => {
    setEditingRawJson(true);
    setEditingActions(false);
    setIsEditing(false);
    
    // Update the raw JSON string with the current prediction parsed
    if (caption && caption.conversation && caption.conversation.predictionParsed) {
      setRawJsonString(JSON.stringify(caption.conversation.predictionParsed, null, 2));
    }
  };

  // Save text changes
  const handleSaveText = () => {
    // Create a modified caption object with updated text
    const updatedCaption = createUpdatedCaption('text');
    onSave(updatedCaption);
    setIsEditing(false);
  };
  
  // Save action changes
  const handleSaveActions = () => {
    // Create a modified caption object with updated action inputs
    const updatedCaption = createUpdatedCaption('actions');
    onSave(updatedCaption);
    setEditingActions(false);
  };
  
  // Save raw JSON changes
  const handleSaveRawJson = () => {
    try {
      // Parse the JSON string to make sure it's valid
      const parsedJson = JSON.parse(rawJsonString);
      
      // Create a modified caption object with the new predictionParsed
      const updatedCaption = createUpdatedCaption('raw_json', parsedJson);
      onSave(updatedCaption);
      setEditingRawJson(false);
      setJsonError('');
    } catch (error) {
      setJsonError(`Invalid JSON: ${error.message}`);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset to original values
    if (caption && caption.conversation) {
      if (caption.conversation.value) {
        setText(caption.conversation.value);
      }
      
      if (caption.conversation.predictionParsed && caption.conversation.predictionParsed.length > 0) {
        const parsedActions = caption.conversation.predictionParsed.map(action => {
          return {
            action_type: action.action_type || '',
            action_inputs: { ...action.action_inputs } || {},
            thought: action.thought || '',
            original: action
          };
        });
        setActionInputs(parsedActions);
        
        // Reset raw JSON as well
        setRawJsonString(JSON.stringify(caption.conversation.predictionParsed, null, 2));
      }
    }
    
    setIsEditing(false);
    setEditingActions(false);
    setEditingRawJson(false);
    setJsonError('');
    
    if (onCancel) onCancel();
  };

  // Create updated caption object based on edit type
  const createUpdatedCaption = (editType, rawPredictionParsed = null) => {
    if (!caption || !caption.conversation) return { text: text };
    
    const result = { ...caption };
    
    if (editType === 'text') {
      // Update main text value
      result.conversation = { 
        ...result.conversation,
        value: text 
      };
      
      // Also update thought in predictionParsed if it exists
      if (result.conversation.predictionParsed && result.conversation.predictionParsed.length > 0) {
        result.conversation.predictionParsed = result.conversation.predictionParsed.map(pred => ({
          ...pred,
          thought: text
        }));
      }
    } else if (editType === 'actions') {
      // Update action inputs in predictionParsed
      if (result.conversation.predictionParsed && result.conversation.predictionParsed.length > 0) {
        result.conversation.predictionParsed = actionInputs.map((action, index) => {
          const originalPrediction = result.conversation.predictionParsed[index] || {};
          return {
            ...originalPrediction,
            action_type: action.action_type,
            action_inputs: { ...action.action_inputs },
            // Keep the original thought
            thought: originalPrediction.thought || text
          };
        });
      }
    } else if (editType === 'raw_json') {
      // Replace the entire predictionParsed with the parsed JSON
      result.conversation = {
        ...result.conversation,
        predictionParsed: rawPredictionParsed
      };
    }
    
    return result;
  };

  // Handle changes to action inputs
  const handleActionInputChange = (actionIndex, inputField, value) => {
    const updatedActions = [...actionInputs];
    
    if (inputField === 'action_type') {
      updatedActions[actionIndex].action_type = value;
    } else if (inputField.startsWith('coords_')) {
      const coordIndex = parseInt(inputField.split('_')[1]);
      const newCoords = [...(updatedActions[actionIndex].action_inputs.start_coords || [0, 0])];
      newCoords[coordIndex] = parseFloat(value);
      updatedActions[actionIndex].action_inputs.start_coords = newCoords;
    } else if (inputField === 'content') {
      updatedActions[actionIndex].action_inputs.content = value;
    } else if (inputField === 'key') {
      updatedActions[actionIndex].action_inputs.key = value;
    } else {
      // For any other fields, set directly on action_inputs
      updatedActions[actionIndex].action_inputs[inputField] = value;
    }
    
    setActionInputs(updatedActions);
  };

  // Extract action information for display
  const getActionInfo = () => {
    if (!caption || !caption.conversation || !caption.conversation.predictionParsed) {
      return null;
    }

    const actions = caption.conversation.predictionParsed
      .filter(p => p.action_type)
      .map(p => {
        let actionDetails = '';
        
        if (p.action_type === 'click' && p.action_inputs?.start_coords) {
          const coords = p.action_inputs.start_coords;
          actionDetails = `at position (${Math.round(coords[0])}, ${Math.round(coords[1])})`;
        } 
        else if (p.action_type === 'type' && p.action_inputs?.content) {
          actionDetails = `"${p.action_inputs.content}"`;
        }
        else if (p.action_type === 'hotkey' && p.action_inputs?.key) {
          actionDetails = `key "${p.action_inputs.key}"`;
        }
        else if (Object.keys(p.action_inputs || {}).length > 0) {
          actionDetails = JSON.stringify(p.action_inputs);
        }
        
        return {
          type: p.action_type,
          details: actionDetails,
          inputs: p.action_inputs
        };
      });

    return actions.length > 0 ? actions : null;
  };

  const actions = getActionInfo();

  // Render action editor form
  const renderActionEditor = () => {
    if (!actionInputs || actionInputs.length === 0) {
      return <p className="text-gray-500">No actions to edit</p>;
    }

    return (
      <div className="action-editor">
        {actionInputs.map((action, actionIdx) => (
          <div key={actionIdx} className="border p-3 mb-3 rounded bg-gray-50">
            <h4 className="font-medium mb-2">Action {actionIdx + 1}</h4>
            
            <div className="mb-2">
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select
                value={action.action_type || ''}
                onChange={(e) => handleActionInputChange(actionIdx, 'action_type', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              >
                <option value="">Select action type</option>
                <option value="click">click</option>
                <option value="type">type</option>
                <option value="hotkey">hotkey</option>
                <option value="scroll">scroll</option>
                <option value="finished">finished</option>
              </select>
            </div>
            
            {/* Render different input fields based on action type */}
            {action.action_type === 'click' && (
              <div className="mb-2">
                <label className="block text-sm text-gray-600 mb-1">Coordinates</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={action.action_inputs?.start_coords?.[0] || 0}
                    onChange={(e) => handleActionInputChange(actionIdx, 'coords_0', e.target.value)}
                    className="w-1/2 p-1 border rounded text-sm"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={action.action_inputs?.start_coords?.[1] || 0}
                    onChange={(e) => handleActionInputChange(actionIdx, 'coords_1', e.target.value)}
                    className="w-1/2 p-1 border rounded text-sm"
                    placeholder="Y"
                  />
                </div>
              </div>
            )}
            
            {action.action_type === 'type' && (
              <div className="mb-2">
                <label className="block text-sm text-gray-600 mb-1">Content</label>
                <input
                  type="text"
                  value={action.action_inputs?.content || ''}
                  onChange={(e) => handleActionInputChange(actionIdx, 'content', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  placeholder="Text to type"
                />
              </div>
            )}
            
            {action.action_type === 'hotkey' && (
              <div className="mb-2">
                <label className="block text-sm text-gray-600 mb-1">Key</label>
                <input
                  type="text"
                  value={action.action_inputs?.key || ''}
                  onChange={(e) => handleActionInputChange(actionIdx, 'key', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  placeholder="Key name (e.g. enter, tab)"
                />
              </div>
            )}
            
            {/* Display raw JSON of action inputs for advanced editing */}
            <div className="mt-3 pt-2 border-t">
              <details>
                <summary className="text-xs text-blue-600 cursor-pointer">Advanced: Raw Action Inputs</summary>
                <div className="mt-1 overflow-x-auto">
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(action.action_inputs, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render raw JSON editor
  const renderRawJsonEditor = () => {
    return (
      <div className="raw-json-editor">
        <h4 className="font-medium text-sm mb-2">Edit Raw predictionParsed JSON</h4>
        
        {jsonError && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {jsonError}
          </div>
        )}
        
        <textarea
          value={rawJsonString}
          onChange={(e) => setRawJsonString(e.target.value)}
          className="w-full p-2 border rounded font-mono text-sm"
          style={{ minHeight: '300px' }}
          spellCheck="false"
        />
        
        <div className="text-xs text-gray-600 mt-1 mb-3">
          <p>Edit the raw JSON for complete control over the predictionParsed array.</p>
          <p>Each action should have at minimum an <code>action_type</code> and appropriate <code>action_inputs</code>.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="caption-editor bg-white p-4 border rounded shadow-sm">
      <h3 className="text-lg font-medium mb-2">Caption Editor</h3>
      
      {/* Text editing mode */}
      {isEditing ? (
        <div className="text-editor mb-4">
          <h4 className="font-medium text-sm mb-2">Edit Caption Text</h4>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            rows={5}
            placeholder="Enter caption text..."
          />
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveText}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Text
            </button>
          </div>
        </div>
      ) : editingActions ? (
        <div className="action-editor mb-4">
          <h4 className="font-medium text-sm mb-2">Edit Action Details</h4>
          {renderActionEditor()}
          
          <div className="flex justify-end space-x-2 mt-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveActions}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Actions
            </button>
          </div>
        </div>
      ) : editingRawJson ? (
        <div className="raw-json-editor mb-4">
          {renderRawJsonEditor()}
          
          <div className="flex justify-end space-x-2 mt-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveRawJson}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save JSON
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Display mode */}
          <div className="caption-display bg-gray-100 p-3 rounded mb-3">
            <p className="text-base mb-1">{text || "No caption text"}</p>
            
            {actions && actions.length > 0 && (
              <div className="actions mt-2 text-sm">
                <p className="font-medium text-gray-700">Actions:</p>
                <ul className="list-disc pl-5">
                  {actions.map((action, idx) => (
                    <li key={idx} className="text-gray-600">
                      <span className="font-medium">{action.type}</span>
                      {action.details && <span> {action.details}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Show raw JSON preview */}
            <details className="mt-2">
              <summary className="text-xs text-blue-600 cursor-pointer">Show Raw predictionParsed Data</summary>
              <div className="mt-1 overflow-x-auto">
                <pre className="text-xs bg-gray-800 text-gray-100 p-2 rounded">
                  {caption?.conversation?.predictionParsed 
                    ? JSON.stringify(caption.conversation.predictionParsed, null, 2) 
                    : "No predictionParsed data available"}
                </pre>
              </div>
            </details>
            
            {/* Show parameter paths for this action */}
            <details className="mt-2">
              <summary className="text-xs text-blue-600 cursor-pointer">Parameter Paths</summary>
              <div className="mt-1 p-2 bg-gray-50 border rounded text-xs">
                <p>Type action parameters that can be overridden at execution time:</p>
                {actionInputs.map((action, actionIdx) => (
                  <div key={actionIdx} className="mt-2">
                    {action.action_type === 'type' && (
                      <>
                        <p className="font-medium">Action {actionIdx + 1} ({action.action_type}):</p>
                        <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="flex items-center">
                            <code className="bg-white px-1 rounded border">
                              {actionIdx}.action_inputs.content
                            </code>
                            <span className="ml-2">= "{action.action_inputs?.content || ''}"</span>
                          </div>
                          <div className="text-gray-500 mt-1 text-xs italic">
                            Text content to type - can be overridden at execution time
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div className="mt-3 border-t pt-2 text-xs">
                  <p className="font-medium">Example API call:</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
{`// POST /api/rpa/execute
{
  "recordingId": "recording_id",
  "parameterOverrides": {
    "0.action_inputs.content": "Overridden text"
  }
}`}
                  </pre>
                </div>
              </div>
            </details>
          </div>
          
          {/* Editing buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleEditText}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit Text
            </button>
            <button 
              onClick={handleEditActions}
              disabled={!actions || actions.length === 0}
              className={`px-4 py-2 rounded ${!actions || actions.length === 0 ? 'bg-gray-300 text-gray-500' : 'bg-green-600 text-white'}`}
            >
              Edit Actions
            </button>
            <button 
              onClick={handleEditRawJson}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Edit Raw JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}