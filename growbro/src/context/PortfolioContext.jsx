import { createContext, useContext } from 'react'

// Create the context
export const PortfolioContext = createContext(null)

// Create a custom hook to use the context
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error(
      'usePortfolioContext must be used within a PortfolioProvider'
    )
  }
  return context
}
