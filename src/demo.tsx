import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from './components/login/LoginPage'

export default function Demo() {
  return (
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}
