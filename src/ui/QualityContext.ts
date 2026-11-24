import { createContext, useContext } from 'react'
import type { Quality } from '../scene/quality'

export const QualityContext = createContext<Quality>('full')
export const useQuality = () => useContext(QualityContext)
