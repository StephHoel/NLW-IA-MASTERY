import { api } from '@/lib/axios'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { FileVideo, Upload } from 'lucide-react'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'

import { Button } from './ui/Button'
import { Label } from './ui/Label'
import { Separator } from './ui/Separator'
import { Textarea } from './ui/Textarea'

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Carregando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!',
}

interface VideoProps {
  onVideoUploaded: (id: string) => void
}

export default function VideoInputForm(props: VideoProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<Status>('waiting')

  const [progress, setProgress] = useState(0)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) return

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    // console.log('Convert started.')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', (log) => console.log(log))

    ffmpeg.on('progress', (progress) => {
      // console.log('Convert progress:', Math.round(progress.progress * 100))
      setProgress(Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File(
      [audioFileBlob],
      video.name.replace('.mp4', '.mp3'),
      {
        type: 'audio/mpeg',
      },
    )

    // console.log('Convert finished.')

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) return

    const audioFile = await convertVideoToAudio(videoFile)

    setStatus('converting')

    const data = new FormData()

    data.append('file', audioFile)

    setStatus('uploading')

    const response = await api.post('/videos', data)

    const videoId = response.data.video.id

    setStatus('generating')

    await api.post(`/videos/${videoId}/transcription`, { prompt })

    setStatus('success')

    props.onVideoUploaded(videoId)
  }

  const previewURL = useMemo(() => {
    if (!videoFile) return null

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <Label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL ?? undefined}
            controls={false}
            className="pointer-events-none absolute aspect-video inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </Label>

      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-1">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          disabled={status !== 'waiting'}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button
        data-success={status === 'success'}
        disabled={status !== 'waiting'}
        type="submit"
        className="relative w-full h-10 rounded-lg data-[success=true]:bg-emerald-400"
      >
        <div
          className="absolute top-0 left-0 h-full rounded-lg bg-violet-400"
          style={{ width: `${progress}%` }}
        ></div>
        <span
          className={`relative z-10 flex items-center justify-center w-full h-full ${
            progress >= 99 ? 'text-white' : ''
          }`}
        >
          {status === 'waiting' ? (
            <>
              Carregar vídeo
              <Upload className="w-4 h-4 ml-2" />
            </>
          ) : (
            statusMessages[status]
          )}
        </span>
      </Button>
    </form>
  )
}
