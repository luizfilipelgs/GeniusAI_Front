import { useEffect, useState, useRef } from 'react'
import SendIcon from '@mui/icons-material/Send'
import DownloadIcon from '@mui/icons-material/Download'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { useNavigate } from 'react-router-dom'
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Typography,
} from '@mui/material'
import InputImg from '../../components/inputImg/InputImg'
import ResultScreen from '../../components/resultScreen/ResultScreen'
import getAnaliseApi from '../../API'
import Header from '../../components/header/Header'
import Intro from '../../components/Intro'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

type AnaliseType =
  | [{ label: string }, string, { label: string }, { label: string }]
  | []

export default function Analise() {
  const [modelo, setModelo] = useState('SE-RegUNet 4GF')
  const [isResetImg, setIsResetImg] = useState(false)
  const [analise, setAnalise] = useState<AnaliseType>([])
  const [selectedImage, setSelectedImage] = useState<Blob | null>(null)
  const [isSend, setIsSend] = useState(false)
  const navigate = useNavigate()
  const downloadRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    setIsResetImg(false)
  }, [modelo])

  const handleChangeModelo = (e: SelectChangeEvent<string>) => {
    setModelo(e.target.value as string)
  }

  const handleSend = async () => {
    // console.log('Send start')
    setIsResetImg(false)
    setIsSend(true)

    if (selectedImage) {
      const result = await getAnaliseApi(selectedImage, modelo)
      // console.log('Received result:', result)
      setAnalise(result)
      // console.log('Set result to state')
    }

    setIsSend(false)
    // console.log('Send end')
    setSelectedImage(null)
  }

  const handleReset = async () => {
    // console.log('reset')
    setIsResetImg(true)
    setAnalise([])
    setIsSend(false)
  }

  const handleDownload = () => {
    if (downloadRef.current && analise[1]) {
      // Checando se analise[1] é um Blob (por simplicidade, checaremos se é um objeto)
      if (typeof analise[1] === 'object') {
        const objectURL = URL.createObjectURL(analise[1])
        downloadRef.current.href = objectURL
        downloadRef.current.click()
        URL.revokeObjectURL(objectURL) // Limpeza para liberar memória
      } else {
        // Caso contrário, é uma string de URL
        downloadRef.current.href = analise[1]
        downloadRef.current.click()
      }
    }
  }

  const modelosList = [
    'SE-RegUNet 4GF',
    'SE-RegUNet 16GF',
    'AngioNet',
    'EffUNet++ B5',
    'Reg-SA-UNet++',
    'UNet3+',
  ]
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <a
        ref={downloadRef}
        style={{ display: 'none' }}
        download="result_image.jpg"
      ></a>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Header />
        <Intro />
        <Box
          sx={{
            display: 'flex',
            padding: '15px',
            // border: '0.0625rem solid black',
            width: '95%',
            height: '45rem',
            justifyContent: 'space-evenly',
            gap: '0.625rem',
          }}
        >
          <Box>
            {/* Side left */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                margin: '.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#001BA1',
                }}
              >
                Modelo:
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={modelo}
                  onChange={handleChangeModelo}
                  sx={{ width: '12.5rem', height: '2.5rem', color: '#001BA1' }}
                >
                  {modelosList.map((modelo, index) => (
                    <MenuItem
                      key={index}
                      value={modelo}
                      sx={{ color: '#001BA1' }}
                    >
                      {modelo}
                    </MenuItem>
                  ))}
                </Select>
              </Typography>

              <Button
                size="large"
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSend}
                sx={{ width: '9.375rem', height: '2.5rem' }}
              >
                Enviar
              </Button>
              <Button
                size="large"
                variant="outlined"
                endIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{ width: '9.375rem', height: '2.5rem' }}
              >
                Limpar
              </Button>
            </Box>
            <InputImg
              isResetImg={isResetImg}
              setSelectedImage={setSelectedImage}
            />
          </Box>
          <Box>
            {/* Side rigth */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                margin: '1.875rem 0.5rem 0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#001BA1' }}
              >{`Possui Doença: ${analise?.[2]?.label ?? ''}`}</Typography>

              <Button
                size="large"
                variant="outlined"
                endIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ width: '9.375rem', height: '2.5rem' }}
              >
                Baixar
              </Button>
            </Box>
            <ResultScreen
              isResetImg={isResetImg}
              urlImgAnalise={analise[1] ?? ''}
              isSend={isSend}
            />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ mb: '2rem' }}>
          {analise[3]?.label}
        </Typography>
      </Box>
    </ThemeProvider>
  )
}
