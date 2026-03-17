const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function callAI(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8binstant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  })
  const data = await res.json()
  console.log('Groq response:', data)
  return data.choices[0].message.content
}