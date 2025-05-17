// Message-related components
const { useState } = React;

// Single message component
export const Message = ({ message }) => {
  const { role, content, timestamp, isIntermediate, isFinalMessage } = message;

  let bgColor = 'bg-white';
  let textAlign = 'text-left';
  let border = '';

  if (role === 'user') {
    bgColor = 'bg-blue-50';
  } else if (role === 'system') {
    bgColor = 'bg-gray-100';
    textAlign = 'text-center';
  } else if (role === 'assistant') {
    if (isFinalMessage) {
      bgColor = 'bg-green-50';
      border = 'border border-green-200';
    } else if (isIntermediate) {
      bgColor = 'bg-gray-50';
      border = 'border border-gray-200';
    }
  }

  return (
    <div className={`p-4 mb-4 rounded-lg ${bgColor} ${textAlign} ${border}`}>
      <div className="flex justify-between items-center mb-1">
        {role === 'user' && <div className="font-semibold text-blue-600">You</div>}
        {role === 'assistant' && (
          <div className="font-semibold text-green-600 flex items-center">
            AI Assistant
            {isFinalMessage && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Final Response</span>}
            {isIntermediate && <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Thinking</span>}
          </div>
        )}
        {timestamp && (
          <div className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
};

// Message list component
export const MessageList = ({ messages, messageEndRef }) => {
  return (
    <>
      {messages.length === 0 && (
        <div className="text-center text-gray-500 my-8">
          Send an instruction to get started
        </div>
      )}
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      <div ref={messageEndRef} />
    </>
  );
};

// Intermediate messages component (AI thinking process)
export const IntermediateMessages = ({ messages }) => {
  const [showMessages, setShowMessages] = useState(false);
  
  if (messages.length === 0) return null;

  return (
    <div className="mt-4 mb-4">
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="flex items-center justify-between w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="font-medium">
          {showMessages ? 'Hide' : 'Show'} AI Thinking Process ({messages.length} steps)
        </div>
        <div className="text-gray-600">
          {showMessages ? '▼' : '▶'}
        </div>
      </button>

      {showMessages && (
        <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
          {messages.map((message, index) => (
            <div key={index} className="p-3 mb-2 bg-white rounded border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium text-gray-600">Step {index + 1}</div>
                <div className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};