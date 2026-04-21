export const useTheme = () => {
  const isEva = useState('theme-eva', () => false)

  const apply = (val: boolean) => {
    document.documentElement.classList.toggle('eva-theme', val)
    localStorage.setItem('theme', val ? 'eva' : 'default')
  }

  const toggle = () => {
    isEva.value = !isEva.value
    apply(isEva.value)
  }

  const init = () => {
    const val = localStorage.getItem('theme') === 'eva'
    isEva.value = val
    apply(val)
  }

  return { isEva, toggle, init }
}
