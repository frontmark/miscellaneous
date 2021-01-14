import React from 'react'

const ColToFitIcon = (props) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={props.className}>
      <rect x='8' y='2' width='8' height='20' />
      <polyline points='1 14 3 12 1 10' />
      <polyline points='23 14 21 12 23 10' />
    </svg>
  )
}

export default ColToFitIcon
