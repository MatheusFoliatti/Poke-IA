import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function PokedexMain() {
  const { user, logout } = useAuthStore();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<any[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Adicionar mensagem do usuário
    setChat([...chat, { role: 'user', content: message }]);
    setMessage('');

    // TODO: Integrar com API de chat
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        { role: 'assistant', content: 'Em breve vou responder sobre Pokémon!' },
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">🔴 Pokédex AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.username}!</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-2xl p-6 min-h-[600px] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Chat com PokédexAI
          </h2>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chat.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-xl mb-2">👋 Olá, Treinador!</p>
                <p>Pergunte-me sobre qualquer Pokémon!</p>
              </div>
            ) : (
              chat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pergunte sobre Pokémon..."
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Enviar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}