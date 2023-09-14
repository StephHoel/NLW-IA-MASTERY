import { api } from '@/lib/axios'
import { Wand2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from './ui/Button'
import { Label } from './ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select'
import { Separator } from './ui/Separator'
import { Slider } from './ui/Slider'

interface Prompt {
  id: string
  title: string
  template: string
}

interface PromptProps {
  onPromptSelected: (template: string) => void
  onTemperature: (temperature: number) => void
  onFormSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export default function SelectPromptForm(props: PromptProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)
  const [temperature, setTemperature] = useState(0.5)

  useEffect(() => {
    api.get('/prompts').then((response) => {
      setPrompts(response.data)
    })
  }, [])

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === promptId)

    if (!selectedPrompt) return

    props.onPromptSelected(selectedPrompt.template)
  }

  return (
    <form onSubmit={props.onFormSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Prompt</Label>
        <Select onValueChange={handlePromptSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um prompt..." />
          </SelectTrigger>
          <SelectContent>
            {prompts?.map((prompt) => {
              return (
                <SelectItem key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Modelo</Label>
        <Select disabled defaultValue="gpt3.5">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
          </SelectContent>
        </Select>
        <span className="block text-xs text-muted-foreground italic">
          Você poderá customizar essa opção em breve
        </span>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Temperatura</Label>
        <Slider
          min={0}
          max={1}
          value={[temperature]}
          onValueChange={(value) => {
            setTemperature(value[0])
            props.onTemperature(value[0])
          }}
          step={0.1}
        />
        <span className="block text-xs text-muted-foreground italic leading-relaxed">
          Valores mais altos tendem a deixar o resultado mais criativo e com
          possíveis erros.
        </span>
      </div>

      <Separator />

      <Button disabled={props.isLoading} type="submit" className=" w-full">
        Executar
        <Wand2 className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )
}
