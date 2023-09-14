import { useCompletion } from 'ai/react'
import { Github } from 'lucide-react'
import { useState } from 'react'
import SelectPromptForm from './components/SelectPromptForm'
import VideoInputForm from './components/VideoInputForm'
import { Button } from './components/ui/Button'
import { Separator } from './components/ui/Separator'
import { Textarea } from './components/ui/Textarea'

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [temperature, setTemperature] = useState<number>(0.5)

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-type': 'application/json',
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline">
            <Github className="w-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 flex gap-6">
        <div className=" flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              value={input}
              onChange={handleInputChange}
              className="resize-none p-4 leading-relaxed"
              placeholder="Inclua o prompt para a IA..."
            />
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Resultado gerado pela IA..."
              readOnly
              value={completion}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável{' '}
            <code className="text-violet-400">{'{transcription}'}</code> no seu
            prompt para adicionar o conteúdo da transcrição do vídeo
            selecionado.
          </p>
        </div>

        <aside className="w-80 space-y-6">
          <VideoInputForm onVideoUploaded={setVideoId} />

          <Separator />

          <SelectPromptForm
            onFormSubmit={handleSubmit}
            onPromptSelected={setInput}
            onTemperature={setTemperature}
            isLoading={isLoading}
          />
        </aside>
      </main>
    </div>
  )
}
